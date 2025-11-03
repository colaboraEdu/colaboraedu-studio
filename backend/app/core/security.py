"""
Security utilities and middleware for multi-tenancy and RBAC
"""
from typing import Optional, List
from fastapi import HTTPException, status


class SecurityUtils:
    """Security and authorization utilities"""
    
    # Role hierarchy for permission checking (lower number = higher permission)
    ROLE_HIERARCHY = {
        "admin": 1,
        "coordenador": 2, 
        "secretario": 3,
        "professor": 4,
        "orientador": 4,
        "bibliotecario": 5,
        "aluno": 6,
        "responsavel": 6,
    }
    
    @staticmethod
    def check_role_permission(user_role: str, required_role: str) -> bool:
        """
        Check if user role has permission to access a resource
        
        Args:
            user_role: User's current role
            required_role: Minimum required role
            
        Returns:
            True if user has permission
        """
        user_level = SecurityUtils.ROLE_HIERARCHY.get(user_role, 999)
        required_level = SecurityUtils.ROLE_HIERARCHY.get(required_role, 1)
        
        return user_level <= required_level
    
    @staticmethod
    def check_institution_access(
        user_institution_id: str,
        resource_institution_id: str
    ) -> bool:
        """
        Check if user has access to resource from same institution (multi-tenancy)
        
        Args:
            user_institution_id: User's institution ID
            resource_institution_id: Resource's institution ID
            
        Returns:
            True if same institution
        """
        return user_institution_id == resource_institution_id
    
    @staticmethod
    def create_permission_exception(message: str = "Insufficient permissions") -> HTTPException:
        """Create a standardized permission denied exception"""
        return HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=message,
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    @staticmethod
    def create_authentication_exception(
        message: str = "Could not validate credentials"
    ) -> HTTPException:
        """Create a standardized authentication failed exception"""
        return HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=message,
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    @staticmethod
    def validate_student_access(
        user_role: str,
        user_institution_id: str,
        user_id: str,
        student_institution_id: str,
        student_user_id: Optional[str] = None
    ) -> bool:
        """
        Check if user can access student data
        
        Rules:
        - Admin can access any student in same institution
        - Teachers can access students in same institution  
        - Students can only access their own data
        - Parents can access their children's data (TODO: implement parent-child relationship)
        """
        # Institution check (multi-tenancy)
        if user_institution_id != student_institution_id:
            return False
            
        # Role-based checks
        if user_role in ["admin", "coordenador", "secretario", "professor", "orientador"]:
            return True
        elif user_role == "aluno" and student_user_id:
            return user_id == student_user_id
        elif user_role == "responsavel":
            # TODO: Implement parent-child relationship check
            return True
        
        return False