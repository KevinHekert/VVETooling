"""VVE Tooling Backend - Main Application Entry Point.

FastAPI application for VVE (Vereniging Van Eigenaren) management.
Based on architecture documentation and ADRs.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, transactions, units, contributions, documents, budgets, audit, tickets, splitsingsakte
from app.core.config import get_settings

settings = get_settings()


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="""
        VVE Tooling API - Backend voor VVE beheer.

        ## Features
        - **Authentication & RBAC** (FEAT-010): Rol-gebaseerd toegangsbeheer
        - **Transactiebeheer** (FEAT-001): Financiële transacties registreren
        - **Splitsingssleutel** (FEAT-003): Eigendomsverhouding configureren
        - **Contributieberekening** (FEAT-004): Bijdrageberekening per eenheid
        - **Documentbeheer** (FEAT-011): Documenten uploaden en delen

        ## Rollen
        - **Bewoner**: Eigen betalingsstatus inzien
        - **Penningmeester**: Financieel beheer
        - **Bestuurslid**: Documenten en communicatie
        - **Beheerder**: Volledig VVE beheer
        """,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    # CORS middleware (ADR-002: API configuration)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routers
    api_prefix = settings.api_prefix

    app.include_router(auth.router, prefix=api_prefix)
    app.include_router(transactions.router, prefix=api_prefix)
    app.include_router(units.router, prefix=api_prefix)
    app.include_router(contributions.router, prefix=api_prefix)
    app.include_router(documents.router, prefix=api_prefix)
    app.include_router(budgets.router, prefix=api_prefix)
    app.include_router(audit.router, prefix=api_prefix)
    app.include_router(tickets.router, prefix=api_prefix)
    app.include_router(tickets.supplier_router, prefix=api_prefix)
    app.include_router(splitsingsakte.router, prefix=api_prefix)

    @app.get("/health", tags=["system"])
    async def health_check() -> dict[str, str]:
        """Health check endpoint for container orchestration."""
        return {"status": "healthy", "version": settings.app_version}

    @app.get("/", tags=["system"])
    async def root() -> dict[str, str]:
        """Root endpoint with API information."""
        return {
            "name": settings.app_name,
            "version": settings.app_version,
            "docs": "/docs",
        }

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
    )
