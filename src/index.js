import { coinEmitter } from "./emitters/coin_emitter.js";
import { openDB } from "./config/db.js";
import {
  CREATE_TABLE_BTC_VALUE,
  INSERT_BTC_READ,
  SELECT_AVG_PRICE,
} from "./config/queries.js";

console.log("Iniciando leituras...");

const moneyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "usd",
});
const db = await openDB();
await db.exec(CREATE_TABLE_BTC_VALUE);

const handleBTCRead = async (newPrice, counterId) => {
  const time = new Date().toISOString();
  const formattedPrice = moneyFormatter.format(newPrice);
  console.log(`Preço do Bitcoin em ${time} -> U$ ${formattedPrice}`);
  const timeNow = Date.now();
  const id = parseInt(`${timeNow}${counterId}`);

  await db.run(INSERT_BTC_READ, id, time, formattedPrice);
  let dataTable = await db.all(SELECT_AVG_PRICE);

  const values = dataTable.map((e) => {
    const cleanedString = e.price.replace(/[^0-9.]+/g, "");
    return parseFloat(cleanedString);
  });
  const uniqueValues = new Set(values);

  let sumValues = [...uniqueValues].reduce((acc, price) => acc + price, 0);
  const result = sumValues / uniqueValues.size;

  console.log(`Preço médio do Bitcoin: US$ ${result}`);
};

coinEmitter.on("btc_read", async (newPrice) => {
  await handleBTCRead(newPrice, 1);
});
