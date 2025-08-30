import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    vus: 50,
    duration: '30s',
};

export default function () {
    let res = http.get('https://blazedemo.com/');
    check(res, { 'home page loaded correctly': (r) => r.status === 200 });

    res = http.post('https://blazedemo.com/reserve.php', {
        fromPort: 'Boston',
        toPort: 'New York',
    });
    check(res, {
        'flight search successful': (r) =>
            r.status === 200 && r.body.includes('Flights from Boston to New York'),
    });

    sleep(1);
}
