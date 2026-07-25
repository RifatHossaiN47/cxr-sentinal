const fs = require('fs');
['components/LandingView.tsx', 'components/ResultsDashboard.tsx', 'app/api/analyze/route.ts'].forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/\\\`/g, '`').replace(/\\\${/g, '${');
  fs.writeFileSync(f, c);
});
console.log('Fixed files');
