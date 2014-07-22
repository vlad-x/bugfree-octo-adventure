elasticsearch = require('elasticsearch')
fs = require 'fs'
files = require 'files'
request = require 'request'
http = require 'http'
# nodecr = require 'nodecr' # sudo apt-get install tesseract-ocr

module.exports = (app) ->
  class app.API
    try
      fs.mkdirSync('data');
    catch e
      #
    console.log 'ES config', app.config.es
    es = @es = new elasticsearch.Client
      host: app.config.es

    @es.ping
      requestTimeout: 1000,
      hello: "elasticsearch!"
    , (err)->
      console.log 'ES ping', arguments

    fetchFromUrl = (url, dest, cb) ->
      file = fs.createWriteStream(dest)
      request = http.get(url, (response) ->
        response.pipe file
        file.on "finish", ->
          file.close cb # close() is async, call cb after close completes.
      )

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

    resolveUlr = (ad, callback) ->
      request ad.url, (err, response, body) ->
          console.log 'resolve url', response.url #arguments

    processAd = (ad, callback) ->
      if ad.img
        filename = files.getFileName ad.img
        console.log 'ad.img',ad.img
        fetchFromUrl ad.img, 'data/'+filename, (err, path) ->
          console.log 'got icon', arguments
          # nodecr.process('data/' + ad.img, (err, text) ->
          resolveUlr ad, callback
      else
        resolveUlr ad, callback

    # GET /
    @saveData = (req, res) ->
      # console.log 'req.body', req.body
      items = req.body # JSON.parse req.body
      console.log 'saveData', items
      count = 0

      for item in items
        count++
        processAd item

      res.json { result: "OK" }
      #   saveIntoElasticSearch item, (err, resp)->
      #     count--
      #     if count == 0
      #       res.json resp || err || null


    @search = (req, res) ->
      q = req.query.q
      es.search
        index: "ads"
        q: q
      , (err, resp) ->
        console.log err, resp
        res.json resp || err || null
