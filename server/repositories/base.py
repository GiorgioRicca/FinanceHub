

from abc import ABC, abstractmethod
from typing import Dict, List, Optional, TypeVar, Generic
from uuid import uuid4


T = TypeVar('T')


class BaseRepository(Generic[T], ABC):
    """
    Repository base generico per operazioni CRUD su entità.
    Fornisce implementazione in-memory per tutte le operazioni di base.
    Classe astratta che definisce il pattern repository per il sistema.
    """
    
    
    def __init__(self):
        self._data: Dict[str, T] = {}
    
    def get_by_id(self, entity_id: str) -> Optional[T]:
        
        return self._data.get(entity_id)
    
    def create(self, entity: T) -> T:
        
        self._data[entity.id] = entity
        return entity
    
    def update(self, entity_id: str, entity: T) -> Optional[T]:
        
        if entity_id in self._data:
            self._data[entity_id] = entity
            return entity
        return None
    
    def delete(self, entity_id: str) -> bool:
        
        if entity_id in self._data:
            del self._data[entity_id]
            return True
        return False
    
    def get_all(self) -> List[T]:
        
        return list(self._data.values())
    
    def clear_all(self):
        
        self._data.clear()
    
    def count(self) -> int:
        
        return len(self._data)
    
    def exists(self, entity_id: str) -> bool:
        
        return entity_id in self._data