"""
Serviço de extração de dados de PDFs usando IA
"""
import pdfplumber
import pytesseract
from PIL import Image
import io
import json
import re
from typing import Dict, Any, Optional, List
import logging
from datetime import datetime

# Placeholder para Gemini AI (será configurado depois)
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

from ..schemas.pdf_extraction import (
    BulletinData, StudentInfo, SubjectGrade, 
    AttendanceInfo, InstitutionInfo
)

logger = logging.getLogger(__name__)


class PDFExtractor:
    """
    Extrator inteligente de dados de boletins em PDF
    Usa múltiplas técnicas: pdfplumber, OCR, e IA
    """
    
    def __init__(self, gemini_api_key: Optional[str] = None):
        self.gemini_api_key = gemini_api_key
        self.model = None
        
        if GEMINI_AVAILABLE and gemini_api_key:
            try:
                genai.configure(api_key=gemini_api_key)
                self.model = genai.GenerativeModel('gemini-pro')
                logger.info("Gemini AI inicializado com sucesso")
            except Exception as e:
                logger.error(f"Erro ao inicializar Gemini: {e}")
                self.model = None
    
    async def extract_from_pdf(self, pdf_bytes: bytes, filename: str) -> BulletinData:
        """
        Método principal de extração
        
        Args:
            pdf_bytes: Bytes do arquivo PDF
            filename: Nome do arquivo original
            
        Returns:
            BulletinData com informações extraídas
        """
        logger.info(f"Iniciando extração de {filename}")
        
        try:
            # Etapa 1: Extrair texto com pdfplumber
            text = await self._extract_text(pdf_bytes)
            logger.debug(f"Texto extraído (primeiros 500 chars): {text[:500]}")
            
            # Etapa 2: Se texto vazio ou insuficiente, usar OCR
            if len(text.strip()) < 100:
                logger.info("Texto insuficiente, aplicando OCR")
                text = await self._extract_with_ocr(pdf_bytes)
            
            # Etapa 3: Extrair tabelas estruturadas
            tables = await self._extract_tables(pdf_bytes)
            logger.info(f"Encontradas {len(tables)} tabelas")
            
            # Etapa 4: Usar IA para estruturar dados
            if self.model:
                bulletin_data = await self._extract_with_ai(text, tables)
            else:
                # Fallback: extração baseada em regex
                bulletin_data = await self._extract_with_regex(text, tables)
            
            # Etapa 5: Validar e calcular métricas
            bulletin_data = self._validate_and_enrich(bulletin_data)
            
            logger.info(f"Extração concluída: {bulletin_data.student.full_name}")
            return bulletin_data
            
        except Exception as e:
            logger.error(f"Erro na extração: {str(e)}", exc_info=True)
            raise
    
    async def _extract_text(self, pdf_bytes: bytes) -> str:
        """Extrai texto do PDF usando pdfplumber"""
        text_parts = []
        
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for page_num, page in enumerate(pdf.pages, 1):
                try:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(f"--- Página {page_num} ---\n{page_text}")
                except Exception as e:
                    logger.warning(f"Erro ao extrair texto da página {page_num}: {e}")
        
        return "\n\n".join(text_parts)
    
    async def _extract_tables(self, pdf_bytes: bytes) -> List[List[List[str]]]:
        """Extrai tabelas estruturadas do PDF"""
        all_tables = []
        
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for page in pdf.pages:
                try:
                    tables = page.extract_tables()
                    if tables:
                        all_tables.extend(tables)
                except Exception as e:
                    logger.warning(f"Erro ao extrair tabelas: {e}")
        
        return all_tables
    
    async def _extract_with_ocr(self, pdf_bytes: bytes) -> str:
        """Usa OCR quando texto não está disponível"""
        try:
            # Converter PDF para imagem e aplicar OCR
            from pdf2image import convert_from_bytes
            
            images = convert_from_bytes(pdf_bytes, dpi=300)
            text_parts = []
            
            for i, image in enumerate(images, 1):
                try:
                    text = pytesseract.image_to_string(image, lang='por')
                    text_parts.append(f"--- Página {i} (OCR) ---\n{text}")
                except Exception as e:
                    logger.warning(f"Erro no OCR da página {i}: {e}")
            
            return "\n\n".join(text_parts)
            
        except Exception as e:
            logger.error(f"Erro no processamento OCR: {e}")
            return ""
    
    async def _extract_with_ai(self, text: str, tables: List) -> BulletinData:
        """Usa Gemini AI para estruturar dados"""
        
        prompt = f"""
Você é um especialista em extrair dados estruturados de boletins escolares.

Analise o seguinte texto extraído de um boletim escolar e retorne um JSON com a estrutura exata abaixo.

TEXTO DO BOLETIM:
{text[:5000]}  # Limitar a 5000 caracteres

INSTRUÇÕES:
1. Extraia TODOS os dados disponíveis
2. Para notas, aceite valores de 0 a 10
3. Se um campo não for encontrado, use null
4. Disciplinas comuns: Português, Matemática, História, Geografia, Ciências, etc.
5. Calcule médias quando possível

FORMATO JSON ESPERADO:
{{
    "student": {{
        "full_name": "Nome Completo do Aluno",
        "enrollment_number": "Matrícula",
        "birth_date": "DD/MM/YYYY ou null",
        "class_name": "9º Ano A",
        "academic_year": 2024,
        "semester": 1
    }},
    "institution": {{
        "name": "Nome da Escola",
        "cnpj": "00.000.000/0000-00 ou null",
        "address": "Endereço ou null"
    }},
    "grades": [
        {{
            "subject_name": "Português",
            "grade_1": 8.5,
            "grade_2": 7.0,
            "grade_3": 9.0,
            "grade_4": 8.0,
            "average": 8.1,
            "status": "Aprovado"
        }}
    ],
    "attendance": {{
        "total_days": 200,
        "present_days": 190,
        "percentage": 95.0
    }},
    "observations": "Observações gerais ou null",
    "confidence_score": 0.95
}}

Retorne APENAS o JSON, sem explicações adicionais.
"""
        
        try:
            response = self.model.generate_content(prompt)
            json_text = response.text.strip()
            
            # Limpar possíveis marcadores de código
            json_text = json_text.replace('```json', '').replace('```', '').strip()
            
            data = json.loads(json_text)
            
            # Converter para objetos Pydantic
            bulletin_data = BulletinData(**data)
            bulletin_data.extracted_at = datetime.utcnow()
            
            return bulletin_data
            
        except Exception as e:
            logger.error(f"Erro na extração com IA: {e}")
            # Fallback para regex
            return await self._extract_with_regex(text, tables)
    
    async def _extract_with_regex(self, text: str, tables: List) -> BulletinData:
        """Fallback: extração baseada em regex e heurísticas"""
        logger.info("Usando extração baseada em regex (fallback)")
        
        # Extrair nome (geralmente no topo do documento)
        name_patterns = [
            r"(?:Aluno|Nome):\s*([A-ZÁÉÍÓÚÇ][a-záéíóúç\s]+)",
            r"^([A-ZÁÉÍÓÚÇ][a-záéíóúç\s]+)(?:\n|$)",
        ]
        full_name = "Nome não encontrado"
        for pattern in name_patterns:
            match = re.search(pattern, text, re.MULTILINE | re.IGNORECASE)
            if match:
                full_name = match.group(1).strip()
                break
        
        # Extrair matrícula
        enrollment_match = re.search(r"(?:Matrícula|RA|Registro):\s*(\d+)", text, re.IGNORECASE)
        enrollment_number = enrollment_match.group(1) if enrollment_match else None
        
        # Extrair ano letivo
        year_match = re.search(r"(?:Ano Letivo|Ano):\s*(\d{4})", text, re.IGNORECASE)
        academic_year = int(year_match.group(1)) if year_match else datetime.now().year
        
        # Extrair turma
        class_match = re.search(r"(?:Turma|Série|Classe):\s*([^\n]+)", text, re.IGNORECASE)
        class_name = class_match.group(1).strip() if class_match else None
        
        # Extrair notas das tabelas
        grades = []
        if tables:
            grades = self._parse_grades_from_tables(tables)
        
        # Extrair frequência
        attendance = None
        total_match = re.search(r"(?:Total de aulas|Dias letivos):\s*(\d+)", text, re.IGNORECASE)
        present_match = re.search(r"(?:Presenças|Dias presentes):\s*(\d+)", text, re.IGNORECASE)
        
        if total_match and present_match:
            attendance = AttendanceInfo(
                total_days=int(total_match.group(1)),
                present_days=int(present_match.group(1))
            )
        
        # Montar resultado
        student = StudentInfo(
            full_name=full_name,
            enrollment_number=enrollment_number,
            class_name=class_name,
            academic_year=academic_year
        )
        
        bulletin_data = BulletinData(
            student=student,
            grades=grades,
            attendance=attendance,
            confidence_score=0.6  # Confiança menor para regex
        )
        
        return bulletin_data
    
    def _parse_grades_from_tables(self, tables: List) -> List[SubjectGrade]:
        """Parseia notas das tabelas extraídas"""
        grades = []
        
        for table in tables:
            if not table or len(table) < 2:
                continue
            
            # Assumir primeira linha como cabeçalho
            headers = [str(h).strip().lower() if h else "" for h in table[0]]
            
            # Procurar colunas relevantes
            subject_col = self._find_column(headers, ["disciplina", "matéria", "subject"])
            if subject_col is None:
                continue
            
            # Colunas de notas
            grade_cols = {
                "grade_1": self._find_column(headers, ["1º bim", "bim 1", "n1", "1ª av"]),
                "grade_2": self._find_column(headers, ["2º bim", "bim 2", "n2", "2ª av"]),
                "grade_3": self._find_column(headers, ["3º bim", "bim 3", "n3", "3ª av"]),
                "grade_4": self._find_column(headers, ["4º bim", "bim 4", "n4", "4ª av"]),
                "average": self._find_column(headers, ["média", "average", "final"])
            }
            
            # Processar linhas de dados
            for row in table[1:]:
                if not row or len(row) <= subject_col:
                    continue
                
                subject_name = str(row[subject_col]).strip()
                if not subject_name or len(subject_name) < 3:
                    continue
                
                grade_data = {"subject_name": subject_name}
                
                for field, col_idx in grade_cols.items():
                    if col_idx is not None and col_idx < len(row):
                        try:
                            value = self._parse_grade(row[col_idx])
                            if value is not None:
                                grade_data[field] = value
                        except:
                            pass
                
                try:
                    grades.append(SubjectGrade(**grade_data))
                except Exception as e:
                    logger.warning(f"Erro ao criar SubjectGrade: {e}")
        
        return grades
    
    def _find_column(self, headers: List[str], keywords: List[str]) -> Optional[int]:
        """Encontra coluna por palavras-chave"""
        for i, header in enumerate(headers):
            for keyword in keywords:
                if keyword in header:
                    return i
        return None
    
    def _parse_grade(self, value: Any) -> Optional[float]:
        """Converte valor para nota numérica"""
        if value is None:
            return None
        
        # Remover espaços e vírgulas
        value_str = str(value).strip().replace(',', '.')
        
        # Tentar converter para float
        try:
            grade = float(value_str)
            if 0 <= grade <= 10:
                return round(grade, 2)
        except:
            pass
        
        return None
    
    def _validate_and_enrich(self, bulletin_data: BulletinData) -> BulletinData:
        """Valida e enriquece dados extraídos"""
        
        # Calcular médias faltantes
        for grade in bulletin_data.grades:
            if grade.average is None or grade.average == 0:
                grade.average = grade.calculate_average()
            
            # Determinar status se não informado
            if not grade.status:
                if grade.average >= 7.0:
                    grade.status = "Aprovado"
                elif grade.average >= 5.0:
                    grade.status = "Recuperação"
                else:
                    grade.status = "Reprovado"
        
        # Calcular percentual de frequência
        if bulletin_data.attendance:
            if bulletin_data.attendance.percentage is None:
                total = bulletin_data.attendance.total_days
                present = bulletin_data.attendance.present_days
                if total > 0:
                    bulletin_data.attendance.percentage = round((present / total) * 100, 2)
        
        # Ajustar confidence score baseado na completude dos dados
        completeness_score = 0
        if bulletin_data.student.full_name != "Nome não encontrado":
            completeness_score += 0.3
        if bulletin_data.student.enrollment_number:
            completeness_score += 0.1
        if len(bulletin_data.grades) > 0:
            completeness_score += 0.4
        if bulletin_data.attendance:
            completeness_score += 0.2
        
        bulletin_data.confidence_score = max(
            bulletin_data.confidence_score,
            round(completeness_score, 2)
        )
        
        return bulletin_data


# Função auxiliar para uso externo
async def extract_bulletin_data(
    pdf_bytes: bytes, 
    filename: str,
    gemini_api_key: Optional[str] = None
) -> BulletinData:
    """
    Função de conveniência para extrair dados de boletim
    
    Args:
        pdf_bytes: Bytes do arquivo PDF
        filename: Nome do arquivo
        gemini_api_key: Chave da API Gemini (opcional)
        
    Returns:
        BulletinData com dados extraídos
    """
    extractor = PDFExtractor(gemini_api_key=gemini_api_key)
    return await extractor.extract_from_pdf(pdf_bytes, filename)
