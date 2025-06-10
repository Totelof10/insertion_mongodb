const { MongoClient } = require("mongodb");
const { faker } = require("@faker-js/faker");

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

const typesTransaction = ["achat", "abonnement", "paiement partiel", "virement bancaire"];

// Génère une transaction aléatoire
function generateTransaction() {
  return {
    date: faker.date.between({ from: '2024-01-01', to: '2024-12-31' }).toISOString().split('T')[0],
    montant: parseFloat(faker.finance.amount(10, 1000, 2)),
    type: faker.helpers.arrayElement(typesTransaction)
  };
}

// Loi géométrique simple pour nombre de transactions : décroissance rapide, moyenne autour de 10
function getNombreTransactions() {
  const p = 0.1;
  let count = 0;
  while (Math.random() > p) {
    count++;
    // Par sécurité on peut couper à 1000 transactions max pour éviter les extrêmes
    if (count > 748) break;
  }
  return count + 1; // au moins 1 transaction
}

// Génère un client avec un nombre variable de transactions
function generateRandomClient() {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const nombreTransactions = getNombreTransactions();

  return {
    nom: `${firstName} ${lastName}`,
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    historique_transactions: Array.from({ length: nombreTransactions }, generateTransaction)
  };
}

async function insertClients() {
  try {
    await client.connect();
    const db = client.db("bigdata_dashboard");
    const collection = db.collection("clients");

    const clients = [];
    for (let i = 0; i < 10000; i++) {
      clients.push(generateRandomClient());
    }

    console.time("Insertion");
    const result = await collection.insertMany(clients);
    console.timeEnd("Insertion");

    console.log(`✅ ${result.insertedCount} clients insérés`);
  } catch (err) {
    console.error("❌ Erreur :", err);
  } finally {
    await client.close();
  }
}

insertClients();
