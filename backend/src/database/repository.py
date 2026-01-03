"""
Database repository for CRUD operations
"""
import os

from sqlalchemy import desc, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from .models import Base, ScrambleModel, SolutionModel


class DatabaseRepository:
    """Repository for database operations"""

    def __init__(self, database_url: str | None = None):
        """
        Initialize repository

        Args:
            database_url: PostgreSQL connection string (defaults to env var)
        """
        self.database_url = database_url or os.getenv(
            "DATABASE_URL",
            "postgresql+asyncpg://postgres:postgres@localhost:5432/rubik_cube"
        )

        self.engine = create_async_engine(
            self.database_url,
            echo=False,
            pool_pre_ping=True,
        )

        self.async_session = async_sessionmaker(
            self.engine,
            class_=AsyncSession,
            expire_on_commit=False,
        )

    async def init_db(self):
        """Initialize database tables"""
        async with self.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    async def close(self):
        """Close database connection"""
        await self.engine.dispose()

    async def check_connection(self) -> bool:
        """Check database connectivity"""
        try:
            async with self.async_session() as session:
                await session.execute(select(1))
            return True
        except Exception as e:
            print(f"Database connection check failed: {e}")
            return False

    # Scramble operations

    async def create_scramble(
        self,
        seed: str,
        moves: list,
        move_count: int
    ) -> ScrambleModel:
        """Create a new scramble"""
        async with self.async_session() as session:
            scramble = ScrambleModel(
                seed=seed,
                moves=moves,
                move_count=move_count
            )

            try:
                session.add(scramble)
                await session.commit()
                await session.refresh(scramble)
                return scramble
            except IntegrityError:
                await session.rollback()
                # Seed already exists, fetch existing
                result = await session.execute(
                    select(ScrambleModel).where(ScrambleModel.seed == seed)
                )
                return result.scalar_one()

    async def get_scramble_by_seed(self, seed: str) -> ScrambleModel | None:
        """Get scramble by seed"""
        async with self.async_session() as session:
            result = await session.execute(
                select(ScrambleModel).where(ScrambleModel.seed == seed)
            )
            return result.scalar_one_or_none()

    async def get_recent_scrambles(self, limit: int = 20) -> list[ScrambleModel]:
        """Get recent scrambles"""
        async with self.async_session() as session:
            result = await session.execute(
                select(ScrambleModel)
                .order_by(desc(ScrambleModel.created_at))
                .limit(limit)
            )
            return list(result.scalars().all())

    # Solution operations

    async def create_solution(
        self,
        scramble_id: str | None,
        solver_type: str,
        moves: list,
        move_count: int,
        compute_time_ms: float,
        success: bool,
        error_message: str | None = None
    ) -> SolutionModel:
        """Create a new solution"""
        async with self.async_session() as session:
            solution = SolutionModel(
                scramble_id=scramble_id,
                solver_type=solver_type,
                moves=moves,
                move_count=move_count,
                compute_time_ms=compute_time_ms,
                success=success,
                error_message=error_message
            )

            session.add(solution)
            await session.commit()
            await session.refresh(solution)
            return solution

    async def get_solution_history(
        self,
        solver_type: str | None = None,
        limit: int = 20,
        offset: int = 0
    ) -> tuple[list[SolutionModel], int]:
        """
        Get solution history with optional filtering

        Returns:
            Tuple of (solutions, total_count)
        """
        async with self.async_session() as session:
            query = select(SolutionModel)

            if solver_type:
                query = query.where(SolutionModel.solver_type == solver_type)

            # Get total count
            count_result = await session.execute(
                select(func.count()).select_from(query.subquery())
            )
            total_count = count_result.scalar()

            # Get paginated results
            query = query.order_by(desc(SolutionModel.created_at)).limit(limit).offset(offset)
            result = await session.execute(query)
            solutions = list(result.scalars().all())

            return solutions, total_count


# Global repository instance
repository: DatabaseRepository | None = None


def get_repository() -> DatabaseRepository:
    """Get or create global repository instance"""
    global repository
    if repository is None:
        repository = DatabaseRepository()
    return repository
