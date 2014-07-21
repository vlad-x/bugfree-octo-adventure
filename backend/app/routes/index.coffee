module.exports = (app) ->
  # Index
  app.get '/', app.ApplicationController.index
  app.get '/api/search', app.API.search
  app.post '/api/savedata', app.API.saveData

  # Error handling (No previous route found. Assuming it’s a 404)
  app.get '/*', (req, res) ->
    NotFound res

  NotFound = (res) ->
    res.render '404', status: 404, view: 'four-o-four'
