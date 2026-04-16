import http from 'k6/http';
import { check, sleep } from 'k6';

// Konfigurimi i "butë" për Localhost (Kompjuterin tënd)
export const options = {
  stages: [
    { duration: '10s', target: 10 }, // Ngjitu ngadalë te 10 përdorues
    { duration: '20s', target: 10 }, // Mbaj 10 përdorues njëkohësisht për 20 sekonda
    { duration: '10s', target: 0 },  // Fiku ngadalë
  ],
};

export default function () {
  // Roboti kërkon faqen e Login-it
  const res = http.get('http://localhost:3000/sq/login');
  
  // Verifikon që faqja u përgjigj saktë
  check(res, {
    'statusi është 200 (OK)': (r) => r.status === 200,
  });

  // Pret 1 sekondë para se të bëjë kërkesën tjetër
  sleep(1);
}