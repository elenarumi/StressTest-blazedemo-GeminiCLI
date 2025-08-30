                                                                                                                                                           │
 │     2 import http from 'k6/http';                                                                                                                               │
 │     3 import { check, sleep } from 'k6';                                                                                                                        │
 │     4 import { parseHTML } from 'k6/html';                                                                                                                      │
 │     5                                                                                                                                                           │
 │     6 export const options = {                                                                                                                                  │
 │     7   stages: [                                                                                                                                               │
 │     8     // Aumenta gradualmente de 1 a 500 usuarios en 2 minutos                                                                                              │
 │     9     { duration: '2m', target: 500 },                                                                                                                      │
 │    10     // Mantiene 500 usuarios durante 5 minutos para la prueba de estrés                                                                                   │
 │    11     { duration: '5m', target: 500 },                                                                                                                      │
 │    12     // Disminuye gradualmente a 0 usuarios en 1 minuto                                                                                                    │
 │    13     { duration: '1m', target: 0 },                                                                                                                        │
 │    14   ],                                                                                                                                                      │
 │    15   thresholds: {                                                                                                                                           │
 │    16     // El 95% de las peticiones deben completarse en menos de 800ms                                                                                       │
 │    17     http_req_duration: ['p(95)<800'],                                                                                                                     │
 │    18     // La tasa de errores debe ser menor al 1%                                                                                                            │
 │    19     http_req_failed: ['rate<0.01'],                                                                                                                       │
 │    20   },                                                                                                                                                      │
 │    21 };                                                                                                                                                        │
 │    22                                                                                                                                                           │
 │    23 export default function () {                                                                                                                              │
 │    24   const baseUrl = 'https://blazedemo.com';                                                                                                                │
 │    25                                                                                                                                                           │
 │    26   // 1. Visitar la página de inicio                                                                                                                       │
 │    27   let res = http.get(baseUrl + '/');                                                                                                                      │
 │    28   check(res, { 'status was 200 (homepage)': (r) => r.status === 200 });                                                                                   │
 │    29   sleep(1);                                                                                                                                               │
 │    30                                                                                                                                                           │
 │    31   // 2. Buscar vuelos (Paris a Buenos Aires)                                                                                                              │
 │    32   res = http.post(baseUrl + '/reserve.php', {                                                                                                             │
 │    33     fromPort: 'Paris',                                                                                                                                    │
 │    34     toPort: 'Buenos Aires',                                                                                                                               │
 │    35   });                                                                                                                                                     │
 │    36   check(res, { 'status was 200 (find flights)': (r) => r.status === 200 });                                                                               │
 │    37                                                                                                                                                           │
 │    38   // Extraer dinámicamente los datos del vuelo para el siguiente paso                                                                                     │
 │    39   const doc = parseHTML(res.body);                                                                                                                        │
 │    40   const flight = doc.find('input[name=flight]').first().attr('value');                                                                                    │
 │    41   const price = doc.find('input[name=price]').first().attr('value');                                                                                      │
 │    42   const airline = doc.find('input[name=airline]').first().attr('value');                                                                                  │
 │    43   const fromPort = doc.find('input[name=fromPort]').first().attr('value');                                                                                │
 │    44   const toPort = doc.find('input[name=toPort]').first().attr('value');                                                                                    │
 │    45                                                                                                                                                           │
 │    46   sleep(2);                                                                                                                                               │
 │    47                                                                                                                                                           │
 │    48   // 3. Elegir el vuelo                                                                                                                                   │
 │    49   res = http.post(baseUrl + '/purchase.php', {                                                                                                            │
 │    50     flight: flight,                                                                                                                                       │
 │    51     price: price,                                                                                                                                         │
 │    52     airline: airline,                                                                                                                                     │
 │    53     fromPort: fromPort,                                                                                                                                   │
 │    54     toPort: toPort,                                                                                                                                       │
 │    55   });                                                                                                                                                     │
 │    56   check(res, { 'status was 200 (choose flight)': (r) => r.status === 200 });                                                                              │
 │    57   sleep(1);                                                                                                                                               │
 │    58                                                                                                                                                           │
 │    59   // 4. Comprar el vuelo                                                                                                                                  │
 │    60   res = http.post(baseUrl + '/confirmation.php', {                                                                                                        │
 │    61     // Los datos del formulario son estáticos en este caso                                                                                                │
 │    62     _token: '',                                                                                                                                           │
 │    63     inputName: 'Elena R',                                                                                                                                 │
 │    64     address: '123 Main St',                                                                                                                               │
 │    65     city: 'Anytown',                                                                                                                                      │
 │    66     state: 'CA',                                                                                                                                          │
 │    67     zipCode: '12345',                                                                                                                                     │
 │    68     cardType: 'visa',                                                                                                                                     │
 │    69     creditCardNumber: '1111222233334444',                                                                                                                 │
 │    70     creditCardMonth: '11',                                                                                                                                │
 │    71     creditCardYear: '2025',                                                                                                                               │
 │    72     nameOnCard: 'Elena R',                                                                                                                                │
 │    73   });                                                                                                                                                     │
 │    74                                                                                                                                                           │
 │    75   // 5. Verificar la página de confirmación                                                                                                               │
 │    76   check(res, {                                                                                                                                            │
 │    77     'status was 200 (purchase confirmation)': (r) => r.status === 200,                                                                                    │
 │    78     'purchase confirmed': (r) => r.body.includes('Thank you for your purchase today!'),                                                                   │
 │    79   });                                                                                                                                                     │
 │    80   sleep(3);                                                                                                                                               │
 │    81 }   
