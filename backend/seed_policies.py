"""
Script para popular o banco de dados com políticas de exemplo
"""
import uuid
from datetime import datetime, timedelta
from app.database import SessionLocal
from app.models.rules_policies import RulePolicy

def create_sample_policies():
    db = SessionLocal()
    
    sample_policies = [
        # Políticas Acadêmicas
        {
            "category": "academic",
            "title": "Critérios de Avaliação",
            "description": "Regras sobre avaliações e notas",
            "content": """
1. As avaliações serão compostas por: provas (60%), trabalhos (30%) e participação (10%).
2. A nota mínima para aprovação é 6.0.
3. Alunos com frequência inferior a 75% serão reprovados por falta.
4. Trabalhos entregues após o prazo terão desconto de 10% por dia de atraso.
5. Atividades de recuperação serão oferecidas para alunos com nota inferior a 6.0.
            """,
            "status": "active",
            "is_mandatory": True,
            "applies_to": ["student", "teacher", "coordinator"],
            "version": "2.0",
            "order": 0
        },
        {
            "category": "academic",
            "title": "Frequência e Presença",
            "description": "Políticas sobre presença e justificativas",
            "content": """
1. É obrigatória a presença de no mínimo 75% das aulas.
2. Faltas podem ser justificadas mediante atestado médico dentro de 48 horas.
3. Atrasos superiores a 15 minutos contam como 0.5 falta.
4. Três atrasos equivalem a uma falta completa.
5. Ausências não justificadas em dias de avaliação resultam em nota zero.
            """,
            "status": "active",
            "is_mandatory": True,
            "applies_to": ["student", "teacher"],
            "version": "1.5",
            "order": 1
        },
        {
            "category": "academic",
            "title": "Plágio e Integridade Acadêmica",
            "description": "Regras sobre honestidade acadêmica",
            "content": """
1. Plágio é considerado falta grave e resultará em nota zero.
2. Todos os trabalhos devem citar fontes adequadamente.
3. Colaboração não autorizada em trabalhos individuais é proibida.
4. Uso de inteligência artificial deve ser declarado quando permitido.
5. Reincidência em plágio pode resultar em medidas disciplinares.
            """,
            "status": "active",
            "is_mandatory": True,
            "applies_to": ["student", "teacher", "coordinator"],
            "version": "1.0",
            "order": 2
        },
        
        # Políticas de Uso
        {
            "category": "usage",
            "title": "Uso Aceitável do Sistema",
            "description": "Como utilizar a plataforma corretamente",
            "content": """
1. Cada usuário é responsável por manter suas credenciais seguras.
2. Compartilhamento de senhas é estritamente proibido.
3. O sistema deve ser usado apenas para fins educacionais.
4. Spam, assédio ou comportamento inadequado não serão tolerados.
5. Tentativas de acesso não autorizado resultarão em suspensão.
6. Respeite os limites de armazenamento de arquivos.
            """,
            "status": "active",
            "is_mandatory": True,
            "applies_to": ["student", "teacher", "coordinator", "admin", "guardian", "secretary", "librarian"],
            "version": "1.0",
            "order": 0
        },
        {
            "category": "usage",
            "title": "Comunicação e Mensagens",
            "description": "Regras para uso do sistema de mensagens",
            "content": """
1. Mantenha comunicação respeitosa e profissional.
2. Não compartilhe informações pessoais sensíveis.
3. Mensagens devem ser relacionadas a atividades educacionais.
4. Linguagem ofensiva ou discriminatória é proibida.
5. Denuncie comportamento inadequado aos administradores.
            """,
            "status": "active",
            "is_mandatory": False,
            "applies_to": ["student", "teacher", "coordinator", "guardian"],
            "version": "1.0",
            "order": 1
        },
        
        # Políticas de Privacidade
        {
            "category": "privacy",
            "title": "Proteção de Dados Pessoais",
            "description": "Como tratamos seus dados (LGPD)",
            "content": """
1. Coletamos apenas dados necessários para operação educacional.
2. Dados pessoais são protegidos com criptografia.
3. Informações não são compartilhadas com terceiros sem consentimento.
4. Você pode solicitar acesso, correção ou exclusão de seus dados.
5. Menores de 18 anos necessitam consentimento dos responsáveis.
6. Dados acadêmicos são mantidos por período legal obrigatório.
7. Notificaremos sobre qualquer violação de dados em até 72 horas.
            """,
            "status": "active",
            "is_mandatory": True,
            "applies_to": ["student", "teacher", "coordinator", "admin", "guardian", "secretary", "librarian"],
            "version": "2.0",
            "order": 0
        },
        {
            "category": "privacy",
            "title": "Cookies e Rastreamento",
            "description": "Uso de cookies e tecnologias similares",
            "content": """
1. Utilizamos cookies essenciais para funcionamento do sistema.
2. Cookies de análise nos ajudam a melhorar a experiência.
3. Você pode gerenciar preferências de cookies nas configurações.
4. Cookies de terceiros são limitados e controlados.
5. Não vendemos dados de navegação a terceiros.
            """,
            "status": "active",
            "is_mandatory": False,
            "applies_to": ["student", "teacher", "coordinator", "admin", "guardian", "secretary", "librarian"],
            "version": "1.0",
            "order": 1
        },
        
        # Políticas de Conduta
        {
            "category": "conduct",
            "title": "Código de Conduta",
            "description": "Comportamento esperado de todos os usuários",
            "content": """
1. Trate todos com respeito, dignidade e cortesia.
2. Discriminação ou assédio de qualquer tipo não será tolerado.
3. Bullying e cyberbullying resultarão em medidas disciplinares.
4. Respeite a diversidade e as diferenças culturais.
5. Conflitos devem ser resolvidos de forma pacífica e construtiva.
6. Denúncias de violação serão tratadas com seriedade e confidencialidade.
            """,
            "status": "active",
            "is_mandatory": True,
            "applies_to": ["student", "teacher", "coordinator", "admin", "guardian", "secretary", "librarian"],
            "version": "1.0",
            "order": 0
        },
        
        # Políticas de Segurança
        {
            "category": "security",
            "title": "Segurança da Informação",
            "description": "Medidas de segurança e boas práticas",
            "content": """
1. Use senhas fortes com no mínimo 8 caracteres.
2. Não compartilhe suas credenciais de acesso.
3. Faça logout ao usar computadores compartilhados.
4. Ative autenticação de dois fatores quando disponível.
5. Reporte atividades suspeitas imediatamente.
6. Não clique em links suspeitos ou baixe arquivos desconhecidos.
7. Mantenha seu email de recuperação atualizado.
            """,
            "status": "active",
            "is_mandatory": True,
            "applies_to": ["student", "teacher", "coordinator", "admin", "guardian", "secretary", "librarian"],
            "version": "1.0",
            "order": 0
        },
        {
            "category": "security",
            "title": "Resposta a Incidentes",
            "description": "Procedimentos em caso de incidente de segurança",
            "content": """
1. Incidentes de segurança serão investigados imediatamente.
2. Usuários afetados serão notificados em até 24 horas.
3. Senhas serão redefinidas em caso de comprometimento.
4. Logs de acesso são mantidos para auditoria.
5. Violações deliberadas resultarão em ações legais.
            """,
            "status": "active",
            "is_mandatory": False,
            "applies_to": ["admin", "coordinator"],
            "version": "1.0",
            "order": 1
        },
    ]
    
    created_count = 0
    admin_id = str(uuid.uuid4())  # ID fictício do admin
    
    for policy_data in sample_policies:
        policy = RulePolicy(
            id=str(uuid.uuid4()),
            **policy_data,
            created_by=admin_id,
            updated_by=admin_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        # Adicionar data de vigência (30 dias atrás)
        policy.effective_date = datetime.utcnow() - timedelta(days=30)
        
        db.add(policy)
        created_count += 1
    
    db.commit()
    db.close()
    
    print(f"✅ {created_count} políticas de exemplo criadas com sucesso!")

if __name__ == "__main__":
    create_sample_policies()
