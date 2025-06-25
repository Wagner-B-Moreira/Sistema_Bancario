const chalk = require('chalk');
const inquirer = require('inquirer');
const fs = require('fs');

// Garante que a pasta 'accounts' exista ao iniciar
if (!fs.existsSync('accounts')) {
    fs.mkdirSync('accounts');
}


// Iniciar o sistema
bancoSaque();

function bancoSaque() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'O que você deseja fazer?',
            choices: [
                'Criar Conta',
                'Consultar Saldo',
                'Depositar',
                'Sacar',
                'SAIR'
            ],
        },
    ])
    .then((answer) => {
        const action = answer['action'];

        if (action === 'Criar Conta') {
            createAccount();
        } else if (action === 'Consultar Saldo') {
            getAccountBalance();
        } else if (action === 'Depositar') {
            deposit();
        } else if (action === 'Sacar') {
            withdraw();
        } else if (action === 'SAIR') {
            console.log(chalk.green('Obrigado por usar o nosso banco!'));
            process.exit();
        }
    })
    .catch((err) => console.log(err));
}

// Criar conta
function createAccount() {
    // Correção: removidos parênteses extras no chalk
    console.log(chalk.bgGreen.black(`Parabéns por escolher o nosso banco!`));
    console.log(chalk.green(`Defina as opções da sua conta a seguir...`));
    buildAccount();
}

function buildAccount() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Digite um nome para sua conta:',
        }
    ])
    .then(answer => {
        const accountName = answer['accountName'].trim();

        if (!accountName) {
            console.log(chalk.bgRed.black('Nome inválido. Tente novamente.'));
            return buildAccount();
        }

        if (fs.existsSync(`accounts/${accountName}.json`)) {
            console.log(chalk.bgRed.black('Esta conta já existe. Escolha outro nome.'));
            return buildAccount();
        }

        fs.writeFileSync(`accounts/${accountName}.json`, '{"balance": 0}');
        console.log(chalk.green('Parabéns, sua conta foi criada com sucesso!'));
        bancoSaque();
    })
    .catch(err => console.log(err));
}

// Verificar se conta existe
function checkAccount(accountName) {
    if (!fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(chalk.bgRed.black('Esta conta não existe.'));
        return false;
    }
    return true;
}

// Consultar saldo
function getAccountBalance() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Digite o nome da sua conta:',
        }
    ])
    .then(answer => {
        const accountName = answer['accountName'];

        if (!checkAccount(accountName)) {
            return bancoSaque();
        } 
    

        const accountData = getAccount(accountName);
        console.log(chalk.bgBlue.black(`Saldo atual: R$${accountData.balance.toFixed(2)}`));
        bancoSaque();
    })
    .catch(err => console.log(err));
} 


// Depositar
function deposit() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Digite o nome da conta que deseja depositar:'
        }
    ])
    .then(answer => {
        const accountName = answer['accountName'];

        if (!checkAccount(accountName)) {
            return bancoSaque();
        }

        inquirer.prompt([
            {
                name: 'amount',
                message: 'Quanto deseja depositar?',
            }
        ])
        .then(answer => {
            const amount = parseFloat(answer['amount'].replace(',', '.'));

            if (isNaN(amount) || amount <= 0) {
                console.log(chalk.bgRed.black('Valor inválido.'));
                return bancoSaque();
            }

            addAmount(accountName, amount);
            bancoSaque();
        });
    })
    .catch(err => console.log(err));
}

// Função para adicionar saldo
function addAmount(accountName, amount) {
    const accountData = getAccount(accountName);
    accountData.balance += amount;
    fs.writeFileSync(`accounts/${accountName}.json`, JSON.stringify(accountData));
    console.log(chalk.green(`Depósito de R$${amount.toFixed(2)} realizado com sucesso!`));
}
 



// Sacar
function withdraw() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Digite o nome da conta:',
        }
    ])
    .then(answer => {
        const accountName = answer['accountName'];

        if (!checkAccount(accountName)) {
            return bancoSaque();
        }

        inquirer.prompt([
            {
                name: 'amount',
                message: 'Quanto deseja sacar?',
            }
        ])
        .then(answer => {
            const amount = parseFloat(answer['amount'].replace(',', '.'));

            if (isNaN(amount) || amount <= 0) {
                console.log(chalk.bgRed.black('Valor inválido.'));
                return bancoSaque();
            }

            removeAmount(accountName, amount);
            bancoSaque();
        });
    })
    .catch(err => console.log(err));
}

// Função para remover saldo (sacar)
function removeAmount(accountName, amount) {
    const accountData = getAccount(accountName);

    if (accountData.balance < amount) {
        console.log(chalk.bgRed.black('Saldo insuficiente.'));
        return;
    }

    accountData.balance -= amount;
    fs.writeFileSync(`accounts/${accountName}.json`, JSON.stringify(accountData));
    console.log(chalk.green(`Saque de R$${amount.toFixed(2)} realizado com sucesso!`));
}

// Utilitário para ler os dados da conta com tratamento de erro
function getAccount(accountName) {
    try {
        const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
            encoding: 'utf8',
            flag: 'r'
        });
        return JSON.parse(accountJSON);
    } catch (err) {
        console.log(chalk.bgRed.black('Erro ao ler os dados da conta.'));
        return { balance: 0 };
    }
}
