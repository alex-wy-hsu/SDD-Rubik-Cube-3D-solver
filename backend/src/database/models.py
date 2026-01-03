"""
SQLAlchemy database models
"""
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
import uuid

Base = declarative_base()


class ScrambleModel(Base):
    """Scramble database model"""
    __tablename__ = "scrambles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    seed = Column(String(64), unique=True, nullable=False, index=True)
    moves = Column(JSONB, nullable=False)
    move_count = Column(Integer, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), index=True)

    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": str(self.id),
            "seed": self.seed,
            "moves": self.moves,
            "move_count": self.move_count,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class SolutionModel(Base):
    """Solution database model (renamed from SolveSessionModel)"""
    __tablename__ = "solutions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scramble_id = Column(UUID(as_uuid=True), ForeignKey("scrambles.id", ondelete="SET NULL"), nullable=True, index=True)
    solver_type = Column(String(20), nullable=False, index=True)
    moves = Column(JSONB, nullable=False)
    move_count = Column(Integer, nullable=False)
    compute_time_ms = Column(Float, nullable=False)
    success = Column(Boolean, nullable=False, default=True, index=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), index=True)

    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": str(self.id),
            "scramble_id": str(self.scramble_id) if self.scramble_id else None,
            "solver_type": self.solver_type,
            "moves": self.moves,
            "move_count": self.move_count,
            "compute_time_ms": self.compute_time_ms,
            "success": self.success,
            "error_message": self.error_message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
