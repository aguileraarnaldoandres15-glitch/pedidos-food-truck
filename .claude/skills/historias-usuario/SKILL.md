---
name: historias-usuario
description: Redacta o ajusta historias de usuario con formato Como/quiero/para y de 3 a 5 criterios de aceptación verificables. Usar cuando haya que escribir, completar o reformular historias del backlog de Pedidos Food Truck antes de cargarlas en Trello.
---

# Historias de usuario

## Formato
```text
FOOD-XX Título corto en infinitivo
**Como** <tipo de usuario>
**quiero** <acción o capacidad>
**para** <beneficio concreto>

**Criterios de aceptación**
- [ ] <criterio verificable>
```

## Reglas
1. Una historia = una sola capacidad. Si hay dos, dividila.
2. El beneficio ("para") explica el valor para quien usa la app, no repite la acción.
3. Escribí entre 3 y 5 criterios verificables con sí/no, con valores concretos (códigos HTTP, estados, límites) y sin palabras vagas como "rápido" o "amigable".
4. Cubrí el caso feliz, al menos un caso de error o borde y la persistencia cuando aplique.
5. Respetá las reglas de negocio definidas en `CLAUDE.md`.
6. Continuá la numeración `FOOD-XX` existente en el tablero de Trello **Pedidos Food Truck**.
7. No crees ni modifiques tarjetas de Trello sin aprobación previa.
8. Escribí en español y en lenguaje de usuario, sin detalles de implementación.