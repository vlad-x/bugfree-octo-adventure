elasticsearch = require('elasticsearch')

module.exports = (app) ->
  class app.API
    console.log 'ES config', app.config.es
    es = @es = new elasticsearch.Client
      host: app.config.es

    @es.ping
      requestTimeout: 1000,
      hello: "elasticsearch!"
    , (err)->
      console.log 'ES ping', arguments

    saveIntoElasticSearch = (data, callback) ->
      console.log 'saveIntoElasticSearch', data
      data.created_at = new Date()
      es.index
        index: "ads"
        type: "ad"
        body: data
      , (err, resp) ->
        console.log err, resp
        callback err, resp

    # GET /
    @saveData = (req, res) ->
      console.log 'req.body', req.body
      items = req.body # JSON.parse req.body
      console.log 'saveData', items
      count = 0
      for item in items
        count++
        saveIntoElasticSearch item, (err, resp)->
          count--
          if count == 0
            res.json resp || err || null


    @search = (req, res) ->
      q = req.query.q
      es.search
        index: "ads"
        q: q
      , (err, resp) ->
        console.log err, resp
        res.json resp || err || null
