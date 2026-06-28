"""
Auth Routes — Google OAuth + JWT
POST /auth/google   → Verify Google token, create/find user, return JWT
GET  /auth/me       → Return current user from JWT
POST /auth/logout   → Client-side only (JWT is stateless)
"""
import os
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from ..database.database import get_db
from ..models.models import User, UserSession
from ..schemas.schemas import (
    GoogleTokenRequest, AuthResponse, UserResponse,
    EmailLoginRequest, UserSignupRequest
)
from ..utils.security import (
    verify_google_token, create_access_token, decode_access_token,
    verify_password, get_password_hash, hash_token
)
from ..config import settings
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer(auto_error=False)


def create_db_session(db: Session, user_id: str, jwt_token: str, login_provider: str) -> UserSession:
    """Helper to store JWT token session inside the sessions table."""
    expiry_time = datetime.utcnow() + timedelta(hours=settings.JWT_EXPIRE_HOURS)
    session = UserSession(
        user_id=user_id,
        jwt_token=hash_token(jwt_token),
        login_provider=login_provider,
        expiry_time=expiry_time
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session



def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Dependency: decode JWT and return the authenticated user."""
    if not credentials:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    
    # Check if session is stored and active in the database
    session = db.query(UserSession).filter(UserSession.jwt_token == hash_token(token)).first()
    if not session and not os.getenv("VERCEL"):
        raise HTTPException(status_code=401, detail="Session expired or logged out")

    if session and session.expiry_time.replace(tzinfo=None) < datetime.utcnow():
        db.delete(session)
        db.commit()
        raise HTTPException(status_code=401, detail="Session expired")

    user = db.query(User).filter(User.id == user_id).first()
    if not user and os.getenv("VERCEL") and payload.get("email"):
        email = payload["email"]
        user = User(
            id=user_id,
            name=email.split("@")[0].replace(".", " ").title(),
            email=email,
            profile_picture=f"https://ui-avatars.com/api/?name={email.split('@')[0]}&background=6366F1&color=fff&size=256",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user



@router.post("/signup", response_model=AuthResponse)
def signup(payload: UserSignupRequest, db: Session = Depends(get_db)):
    """Register a new user via email/password, hash password, automatically log in."""
    # Check if duplicate email
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email address already registered. Please sign in instead."
        )
    
    # Hash password using bcrypt helper
    hashed_pwd = get_password_hash(payload.password)
    
    # Create new user
    new_user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hashed_pwd,
        profile_picture=f"https://ui-avatars.com/api/?name={payload.name.replace(' ', '+')}&background=6366F1&color=fff&size=256"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Generate token
    access_token = create_access_token({"sub": new_user.id, "email": new_user.email})
    
    # Track session in database
    create_db_session(db, new_user.id, access_token, "email")
    
    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=new_user.to_dict()
    )


@router.post("/login", response_model=AuthResponse)
def login(payload: EmailLoginRequest, db: Session = Depends(get_db)):
    """Authenticate user with email and password, register JWT session in database."""
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not user.password_hash:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password. Please verify your credentials."
        )
    
    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password. Please verify your credentials."
        )
        
    # Generate token
    access_token = create_access_token({"sub": user.id, "email": user.email})
    
    # Track session in database
    create_db_session(db, user.id, access_token, "email")
    
    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=user.to_dict()
    )


@router.post("/google", response_model=AuthResponse)
def google_login(payload: GoogleTokenRequest, db: Session = Depends(get_db)):
    """
    Exchange a Google ID token (from frontend Google Sign-In) for a JWT.
    Creates user on first login.
    """
    google_user = verify_google_token(payload.credential)
    
    if not google_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token. Please try signing in again."
        )
    
    # Find or create user
    user = db.query(User).filter(User.email == google_user["email"]).first()
    
    if not user:
        user = User(
            google_id=google_user.get("google_id"),
            name=google_user.get("name", "User"),
            email=google_user["email"],
            profile_picture=google_user.get("picture"),
            picture=google_user.get("picture"),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Update profile picture if changed
        pic = google_user.get("picture")
        if pic and (user.picture != pic or user.profile_picture != pic):
            user.picture = pic
            user.profile_picture = pic
            db.commit()

    access_token = create_access_token({"sub": user.id, "email": user.email})
    
    # Track session in database
    create_db_session(db, user.id, access_token, "google")
    
    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=user.to_dict()
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Return the authenticated user's profile."""
    pic = current_user.profile_picture or current_user.picture
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        picture=pic,
        profile_picture=pic,
        created_at=current_user.created_at.isoformat() if current_user.created_at else None,
    )


@router.post("/logout")
def logout(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Invalidate database session matching the user's active token."""
    if credentials:
        token = credentials.credentials
        session = db.query(UserSession).filter(UserSession.jwt_token == hash_token(token)).first()
        if session:
            db.delete(session)
            db.commit()
    return {"message": "Logged out successfully. Session invalidated."}


@router.post("/dev-login")
def dev_login(db: Session = Depends(get_db)):
    """
    Development-only endpoint for demo mode when Google OAuth is not configured.
    Creates/returns a demo agent account automatically.
    """
    from ..config import settings
    if settings.ENVIRONMENT != "development" or settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=403, detail="Dev login only available in development mode without Google credentials")

    demo_email = "demo@supportmind.ai"
    user = db.query(User).filter(User.email == demo_email).first()
    if not user:
        user = User(
            name="Demo Agent",
            email=demo_email,
            profile_picture="https://ui-avatars.com/api/?name=Demo+Agent&background=6366F1&color=fff&size=256",
            picture="https://ui-avatars.com/api/?name=Demo+Agent&background=6366F1&color=fff&size=256",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token = create_access_token({"sub": user.id, "email": user.email})
    
    # Track session in database
    create_db_session(db, user.id, access_token, "dev")
    
    return {"access_token": access_token, "token_type": "bearer", "user": user.to_dict()}
