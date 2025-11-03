"""
CLI commands for colaboraEDU management
Uses Typer for interactive command-line interface
"""
import typer
from typing import Optional
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
from datetime import datetime

from app.config import settings
from app.models.institution import Institution
from app.models.user import User
from app.core.auth import AuthUtils

# Create CLI app
app = typer.Typer(
    name="colaboraEDU CLI",
    help="Command-line interface for colaboraEDU management",
    add_completion=True
)

# Database setup
engine = create_engine(settings.database_url, echo=settings.database_echo)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        return db
    except Exception as e:
        db.close()
        raise e


@app.command()
def create_superuser(
    email: str = typer.Option(
        ..., 
        prompt="Email do administrador",
        help="Email para login do super usuário"
    ),
    password: str = typer.Option(
        ..., 
        prompt="Senha",
        confirmation_prompt=True,
        hide_input=True,
        help="Senha segura para o administrador"
    ),
    first_name: str = typer.Option(
        ..., 
        prompt="Primeiro nome",
        help="Primeiro nome do administrador"
    ),
    last_name: str = typer.Option(
        ..., 
        prompt="Sobrenome",
        help="Sobrenome do administrador"
    ),
    institution_name: Optional[str] = typer.Option(
        None,
        prompt="Nome da instituição (opcional)",
        help="Nome da instituição. Se não informado, usa/cria instituição padrão"
    )
):
    """
    Cria um super usuário administrador para acessar o dashboard.
    
    Este comando cria:
    - Uma instituição (se não existir)
    - Um usuário com role 'admin' e acesso total ao sistema
    
    O administrador poderá:
    - Acessar o dashboard administrativo
    - Criar outros usuários (professores, alunos, etc.)
    - Gerenciar todas as funcionalidades do sistema
    """
    typer.echo("\n🚀 Criando super usuário administrador...")
    typer.echo("=" * 60)
    
    db = get_db()
    
    try:
        # 1. Verificar se já existe usuário com este email
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            typer.secho(
                f"\n❌ Erro: Já existe um usuário com o email '{email}'",
                fg=typer.colors.RED,
                bold=True
            )
            raise typer.Exit(code=1)
        
        # 2. Criar ou buscar instituição
        if institution_name:
            institution = db.query(Institution).filter(
                Institution.name == institution_name
            ).first()
            
            if not institution:
                typer.echo(f"\n📚 Criando nova instituição: {institution_name}")
                # Gerar CNPJ único baseado em timestamp
                import time
                cnpj = f"{int(time.time() * 1000) % 99999999999999:014d}"
                
                institution = Institution(
                    name=institution_name,
                    cnpj=cnpj,
                    status="active",
                    created_at=datetime.utcnow()
                )
                db.add(institution)
                db.flush()
                typer.secho(f"✅ Instituição criada: {institution.name}", fg=typer.colors.GREEN)
            else:
                typer.echo(f"\n📚 Usando instituição existente: {institution.name}")
        else:
            # Usar instituição padrão ou criar uma
            institution = db.query(Institution).first()
            if not institution:
                typer.echo("\n📚 Criando instituição padrão: 'colaboraEDU'")
                # Gerar CNPJ único
                import time
                cnpj = f"{int(time.time() * 1000) % 99999999999999:014d}"
                
                institution = Institution(
                    name="colaboraEDU",
                    cnpj=cnpj,
                    status="active",
                    created_at=datetime.utcnow()
                )
                db.add(institution)
                db.flush()
                typer.secho("✅ Instituição padrão criada", fg=typer.colors.GREEN)
            else:
                typer.echo(f"\n📚 Usando instituição existente: {institution.name}")
        
        # 3. Hash da senha
        typer.echo("\n🔐 Gerando hash seguro da senha...")
        password_hash = AuthUtils.hash_password(password)
        
        # 4. Criar usuário administrador
        typer.echo(f"\n👤 Criando usuário administrador: {first_name} {last_name}")
        admin_user = User(
            institution_id=institution.id,
            email=email,
            password_hash=password_hash,
            first_name=first_name,
            last_name=last_name,
            role="admin",
            status="active",
            created_at=datetime.utcnow()
        )
        
        db.add(admin_user)
        db.commit()
        
        # 5. Mensagem de sucesso
        typer.echo("\n" + "=" * 60)
        typer.secho("✅ SUPER USUÁRIO CRIADO COM SUCESSO!", fg=typer.colors.GREEN, bold=True)
        typer.echo("=" * 60)
        typer.echo("\n📋 Detalhes do administrador:")
        typer.echo(f"   • ID: {admin_user.id}")
        typer.echo(f"   • Nome: {admin_user.full_name}")
        typer.echo(f"   • Email: {admin_user.email}")
        typer.echo(f"   • Role: {admin_user.role}")
        typer.echo(f"   • Instituição: {institution.name}")
        typer.echo(f"   • Status: {admin_user.status}")
        
        typer.echo("\n🔑 Credenciais de acesso:")
        typer.echo(f"   • Email: {admin_user.email}")
        typer.echo(f"   • Senha: {'*' * len(password)}")
        
        typer.echo("\n🌐 Próximos passos:")
        typer.echo("   1. Acesse o dashboard em: http://localhost:8004/docs")
        typer.echo("   2. Faça login com as credenciais criadas")
        typer.echo("   3. Comece a criar outros usuários do sistema")
        
        typer.secho("\n✨ Pronto para usar o colaboraEDU!", fg=typer.colors.CYAN, bold=True)
        
    except typer.Exit:
        raise
    except Exception as e:
        db.rollback()
        typer.secho(f"\n❌ Erro ao criar super usuário: {str(e)}", fg=typer.colors.RED, bold=True)
        typer.echo(f"\n📝 Detalhes técnicos: {type(e).__name__}")
        raise typer.Exit(code=1)
    finally:
        db.close()


@app.command()
def list_users(
    institution_id: Optional[str] = typer.Option(
        None,
        "--institution",
        "-i",
        help="Filtrar por ID da instituição"
    ),
    role: Optional[str] = typer.Option(
        None,
        "--role",
        "-r",
        help="Filtrar por role (admin, professor, aluno, etc.)"
    )
):
    """
    Lista todos os usuários do sistema.
    """
    typer.echo("\n📋 Listando usuários...")
    typer.echo("=" * 80)
    
    db = get_db()
    
    try:
        query = db.query(User)
        
        if institution_id:
            query = query.filter(User.institution_id == institution_id)
        
        if role:
            query = query.filter(User.role == role)
        
        users = query.all()
        
        if not users:
            typer.secho("\n⚠️  Nenhum usuário encontrado", fg=typer.colors.YELLOW)
            return
        
        typer.echo(f"\nTotal: {len(users)} usuário(s)\n")
        
        for user in users:
            typer.echo(f"ID: {user.id}")
            typer.echo(f"   Nome: {user.full_name}")
            typer.echo(f"   Email: {user.email}")
            typer.echo(f"   Role: {user.role}")
            typer.echo(f"   Status: {user.status}")
            typer.echo(f"   Instituição: {user.institution_id}")
            typer.echo(f"   Criado em: {user.created_at}")
            typer.echo("-" * 80)
        
    except Exception as e:
        typer.secho(f"\n❌ Erro ao listar usuários: {str(e)}", fg=typer.colors.RED)
        raise typer.Exit(code=1)
    finally:
        db.close()


@app.command()
def list_institutions():
    """
    Lista todas as instituições cadastradas.
    """
    typer.echo("\n🏫 Listando instituições...")
    typer.echo("=" * 80)
    
    db = get_db()
    
    try:
        institutions = db.query(Institution).all()
        
        if not institutions:
            typer.secho("\n⚠️  Nenhuma instituição encontrada", fg=typer.colors.YELLOW)
            return
        
        typer.echo(f"\nTotal: {len(institutions)} instituição(ões)\n")
        
        for inst in institutions:
            typer.echo(f"ID: {inst.id}")
            typer.echo(f"   Nome: {inst.name}")
            typer.echo(f"   CNPJ: {inst.cnpj}")
            typer.echo(f"   Status: {inst.status}")
            typer.echo(f"   Criado em: {inst.created_at}")
            
            # Contar usuários
            user_count = db.query(User).filter(User.institution_id == inst.id).count()
            typer.echo(f"   Usuários: {user_count}")
            typer.echo("-" * 80)
        
    except Exception as e:
        typer.secho(f"\n❌ Erro ao listar instituições: {str(e)}", fg=typer.colors.RED)
        raise typer.Exit(code=1)
    finally:
        db.close()


@app.command()
def change_password(
    email: str = typer.Option(
        ...,
        prompt="Email do usuário",
        help="Email do usuário que terá a senha alterada"
    ),
    new_password: str = typer.Option(
        ...,
        prompt="Nova senha",
        confirmation_prompt=True,
        hide_input=True,
        help="Nova senha para o usuário"
    )
):
    """
    Altera a senha de um usuário existente.
    """
    typer.echo("\n🔐 Alterando senha do usuário...")
    typer.echo("=" * 60)
    
    db = get_db()
    
    try:
        # Buscar usuário
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            typer.secho(
                f"\n❌ Erro: Usuário com email '{email}' não encontrado",
                fg=typer.colors.RED,
                bold=True
            )
            raise typer.Exit(code=1)
        
        # Confirmar ação
        confirm = typer.confirm(
            f"\nDeseja realmente alterar a senha de '{user.full_name}' ({email})?"
        )
        
        if not confirm:
            typer.echo("\n⚠️  Operação cancelada")
            raise typer.Exit(code=0)
        
        # Gerar novo hash
        typer.echo("\n🔐 Gerando novo hash da senha...")
        new_password_hash = AuthUtils.hash_password(new_password)
        
        # Atualizar senha
        user.password_hash = new_password_hash
        user.updated_at = datetime.utcnow()
        
        db.commit()
        
        typer.secho("\n✅ Senha alterada com sucesso!", fg=typer.colors.GREEN, bold=True)
        typer.echo(f"   • Usuário: {user.full_name}")
        typer.echo(f"   • Email: {user.email}")
        
    except typer.Exit:
        raise
    except Exception as e:
        db.rollback()
        typer.secho(f"\n❌ Erro ao alterar senha: {str(e)}", fg=typer.colors.RED, bold=True)
        raise typer.Exit(code=1)
    finally:
        db.close()


@app.command()
def version():
    """
    Exibe a versão do colaboraEDU.
    """
    typer.echo(f"\n{settings.app_name} - v{settings.app_version}")
    typer.echo(f"Database: {settings.database_url}")
    typer.echo(f"Debug: {settings.debug}")


if __name__ == "__main__":
    app()
