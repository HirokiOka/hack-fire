const { Client } = require('pg');
const client = new Client({
  user: '',
  host: '',
  database: '',
  password: '',
  port: '',
});

client.connect();

const query = {
  text: '',
  values: [],
};

client
  .query(query)
  .then((res) => {
    console.log(res);
    client.end();
  })
  .catch((e) => console.error(e.stack));
