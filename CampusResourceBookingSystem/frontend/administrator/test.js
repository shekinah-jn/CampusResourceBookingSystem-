const arr = {};

fetch('http://localhost:8000/admin/labs')
    .then(res => res.json())
    .then(data => data.forEach(lab=>console.log(lab)))
    .catch(err => console.error(err));

