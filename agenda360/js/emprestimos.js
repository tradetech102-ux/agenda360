const months = [
  '01', '02', '03', '04', '05', '06',
  '07', '08', '09', '10', '11', '12'
];

let paymentStatus = [];
let baseValue, interestValue, totalValue, interestRate;

function parseBrazilianNumber(str) {
  str = str.replace('R$ ', '').replace(/\./g, '').replace(',', '.');
  return parseFloat(str);
}

function formatBrazilianNumber(value) {
  return value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function padNumber(num) {
  return num.toString().padStart(2, '0');
}

function shortenYear(year) {
  return year.toString().slice(-2);
}

function getOrdinal(n) {
  return `${n}ª`;
}

function generateTable() {
  const name = document.getElementById('name').value;
  const amountStr = document.getElementById('amount').value;
  const installments = parseInt(document.getElementById('installments').value);
  const interestStr = document.getElementById('interest').value;
  const dueDay = parseInt(document.getElementById('dueDay').value);

  const amount = parseBrazilianNumber(amountStr);
  interestRate = parseBrazilianNumber(interestStr) / 100;

  if (!name || isNaN(amount) || amount <= 0 || isNaN(interestRate) || interestRate < 0 || isNaN(dueDay) || dueDay < 1 || dueDay > 31) {
    alert('Por favor, preencha todos os campos corretamente. O dia de vencimento deve ser entre 1 e 31.');
    return;
  }

  baseValue = amount / installments;
  interestValue = baseValue * interestRate;
  totalValue = baseValue + interestValue;

  paymentStatus = new Array(installments).fill('PENDENTE');

  const tableBody = document.getElementById('tableBody');
  tableBody.innerHTML = '';
  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();

  for (let i = 1; i <= installments; i++) {
    const row = document.createElement('tr');
    const dueDate = `${padNumber(dueDay)}/${months[currentMonth]}/${shortenYear(currentYear)}`;
    row.className = 'pending';
    row.innerHTML = `
      <td>${getOrdinal(i)}</td>
      <td>${dueDate}</td>
      <td>R$ ${formatBrazilianNumber(baseValue)}</td>
      <td>R$ ${formatBrazilianNumber(interestValue)}</td>
      <td>R$ ${formatBrazilianNumber(totalValue)}</td>
      <td id="status-${i}">${paymentStatus[i-1]}</td>
      <td>
        <button onclick="markPaid(${i})">PAGO</button>
        <button onclick="markVencido(${i})">VENCIDO</button>
      </td>
    `;
    tableBody.appendChild(row);
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
  }

  document.getElementById('loanTable').style.display = 'table';
  updateMessage(name, amount, installments, dueDay);
}

function markPaid(index) {
  paymentStatus[index-1] = 'PAGO';
  const row = document.getElementById('tableBody').rows[index-1];
  row.className = 'paid';
  document.getElementById(`status-${index}`).textContent = 'PAGO';
  updateMessage(
    document.getElementById('name').value,
    parseBrazilianNumber(document.getElementById('amount').value),
    parseInt(document.getElementById('installments').value),
    parseInt(document.getElementById('dueDay').value)
  );
}

function markVencido(index) {
  paymentStatus[index-1] = 'VENCIDO';
  const row = document.getElementById('tableBody').rows[index-1];
  row.className = 'pending';
  document.getElementById(`status-${index}`).textContent = 'VENCIDO';
  updateMessage(
    document.getElementById('name').value,
    parseBrazilianNumber(document.getElementById('amount').value),
    parseInt(document.getElementById('installments').value),
    parseInt(document.getElementById('dueDay').value)
  );
}

function updateMessage(name, amount, installments, dueDay) {
  let message = `Olá ${name}, veja abaixo as parcelas do valor emprestado com juros:\n\n`;
  message += `Valor Emprestado: R$ ${formatBrazilianNumber(amount)}\n`;
  message += `Número de Parcelas: ${installments}\n\n`;
  message += `Parcelas:\n`;
  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();
  for (let i = 1; i <= installments; i++) {
    const dueDate = `${padNumber(dueDay)}/${months[currentMonth]}/${shortenYear(currentYear)}`;
    const status = paymentStatus[i-1] === 'PAGO' ? 'PG' : '';
    message += `${dueDate} - ${getOrdinal(i)} x R$ ${formatBrazilianNumber(baseValue)} + R$ ${formatBrazilianNumber(interestValue)} (${formatBrazilianNumber(interestRate * 100)}%) = R$ ${formatBrazilianNumber(totalValue)} ${status}\n`;
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
  }

  const messageDiv = document.getElementById('message');
  messageDiv.textContent = message;
  messageDiv.style.display = 'block';
  document.getElementById('copyButton').style.display = 'block';
}

function copyMessage() {
  const message = document.getElementById('message').textContent;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(message).then(() => {
      alert('Mensagem copiada para a área de trabalho!');
    }).catch(err => {
      const textarea = document.createElement('textarea');
      textarea.value = message;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        alert('Mensagem copiada para a área de trabalho!');
      } catch (err) {
        alert('Erro ao copiar a mensagem: ' + err);
      }
      document.body.removeChild(textarea);
    });
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = message;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      alert('Mensagem copiada para a área de trabalho!');
    } catch (err) {
      alert('Erro ao copiar a mensagem: ' + err);
    }
    document.body.removeChild(textarea);
  }
}


document.addEventListener("DOMContentLoaded", () => {
  // Inicialização da Tabela de Empréstimos (Cleave.js)
  if (document.getElementById("amount")) {
    new Cleave("#amount", {
      numeral: true,
      numeralDecimalMark: ",",
      delimiter: ".",
      prefix: "R$ ",
      noImmediatePrefix: true,
      numeralDecimalScale: 2,
      numeralThousandsGroupStyle: "thousand"
    });
  }

  if (document.getElementById("interest")) {
    new Cleave("#interest", {
      numeral: true,
      numeralDecimalMark: ",",
      delimiter: ".",
      numeralDecimalScale: 2,
      numeralThousandsGroupStyle: "thousand"
    });
  }
});
