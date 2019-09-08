const express = require('express')

const app = express()


app.listen(3000, () => {
    console.log('Server Started');   
})

app.set('view engine', 'pug')

require('./startup/routes')(app)