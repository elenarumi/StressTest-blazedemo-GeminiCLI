
# Análisis de Prueba de Estrés para BlazeDemo

## 1. Resumen Ejecutivo

Se realizó una prueba de estrés en el sitio web `blazedemo.com` para evaluar su rendimiento y estabilidad bajo una carga de **500 usuarios concurrentes**.

*   **Resultado Clave:** La aplicación demostró ser **muy estable**, ya que no se produjo ningún error durante la prueba (tasa de error del 0%).
*   **Conclusión Principal:** A pesar de su estabilidad, el sistema sufre una **degradación significativa del rendimiento** bajo la carga máxima. Se ha identificado un cuello de botella en el tiempo de respuesta del servidor, que no logra procesar las peticiones con la velocidad necesaria, provocando latencias notables para los usuarios.

## 2. Configuración de la Prueba

*   **Herramienta:** k6
*   **Script de Prueba:** `blazedemo_stress_test.js`
*   **Escenario de Usuario:**
    1.  Visitar la página de inicio.
    2.  Buscar un vuelo (de París a Buenos Aires).
    3.  Seleccionar el primer vuelo de la lista.
    4.  Ingresar datos y confirmar la compra.
*   **Perfil de Carga:**
    *   **Rampa de subida:** De 1 a 500 usuarios en 2 minutos.
    *   **Carga máxima:** 500 usuarios mantenidos durante 5 minutos.
    *   **Rampa de bajada:** De 500 a 0 usuarios en 1 minuto.

## 3. Resultados Detallados del Informe

A continuación se presentan las métricas más importantes obtenidas al finalizar la prueba.

### Estabilidad

*   **Tasa de Errores (`http_req_failed`):**
    ```
    0.00%
    ```
    **Observación:** Resultado excelente. El servidor gestionó las 88,320 peticiones sin fallar.

### Rendimiento y Tiempos de Respuesta

*   **Duración de Peticiones (`http_req_duration`):**
    *   **p(95): `1.15s`** (El 95% de las peticiones tardaron 1.15s o menos).
    *   **Máximo (`max`): `4.32s`** (La petición más lenta tardó 4.32s).
    *   **Promedio (`avg`): `480.31ms`**.

*   **Umbral de Rendimiento (`threshold`):**
    *   **Resultado:** `FALLIDO`
    *   **Condición:** `p(95) < 800ms`
    *   **Observación:** El objetivo de mantener el 95% de las respuestas por debajo de 800ms no se cumplió. Esto confirma que el sistema se ralentiza bajo carga.

### Carga del Sistema

*   **Peticiones por Segundo (`http_reqs`):**
    ```
    181.65 reqs/s
    ```
    **Observación:** Esta fue la carga promedio que el sistema manejó durante la prueba.

## 4. Análisis del Cuello de Botella

Los resultados indican claramente que el cuello de botella **no es de estabilidad, sino de rendimiento**.

1.  **Síntoma Principal:** A medida que el número de usuarios se acercaba a 500, los tiempos de respuesta aumentaron considerablemente. El `p(95)` de 1.15s y, sobre todo, el `max` de 4.32s, demuestran que las peticiones se están "encolando", esperando a que el servidor las procese.

2.  **Causa Más Probable:** El cuello de botella se encuentra en el **backend (servidor de aplicaciones o base de datos)**. Las operaciones que requieren un procesamiento intensivo, como la escritura en la base de datos al confirmar una compra (`confirmation.php`) o las consultas complejas para buscar vuelos (`reserve.php`), son las candidatas más probables a causar esta ralentización.

## 5. Recomendaciones y Próximos Pasos

1.  **Diagnóstico Detallado:** El siguiente paso crucial es identificar **qué página específica está causando el retraso**. Se recomienda modificar el script de k6 para añadir `tags` a cada petición HTTP. Esto permitirá desglosar los tiempos de respuesta por página y señalar al culpable exacto.

2.  **Monitorización del Backend:** Durante la próxima ejecución de la prueba, el equipo de desarrollo debería monitorizar en tiempo real los recursos del servidor:
    *   Uso de CPU y Memoria.
    *   Número de conexiones activas a la base de datos.
    *   Identificación de consultas lentas (`slow queries`) en la base de datos.

3.  **Optimización:** Una vez identificada la transacción lenta, se debe proceder a optimizar el código de la aplicación o las consultas a la base de datos relacionadas con esa funcionalidad.
