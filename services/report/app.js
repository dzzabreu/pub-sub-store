const RabbitMQService = require('./rabbitmq-service')
const path = require('path')

require('dotenv').config({ path: path.resolve(__dirname, '.env') })

var report = {}
async function updateReport(products) {
    for(let product of products) {
        if(!product.name) {
            continue
        } else if(!report[product.name]) {
            report[product.name] = 1;
        } else {
            report[product.name]++;
        }
    }

}

async function printReport() {
    for (const [key, value] of Object.entries(report)) {
        console.log(`${key} = ${value} sales`);
    }
}

async function processMessage(msg) {
    const deliveryData = JSON.parse(msg.content)
    try {
        if (deliveryData && deliveryData.products) {
            await updateReport(deliveryData.products)
            await printReport()
        }
    } catch (error) {
        console.log(`X ERROR TO PROCESS: ${error}`)
    }
}

async function consume() {
    console.log(`SUCCESSFULLY SUBSCRIBED TO QUEUE: report`)
    await (await RabbitMQService.getInstance()).consume('report', (msg) => { processMessage(msg) })
} 

consume()
