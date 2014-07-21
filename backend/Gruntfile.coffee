module.exports = (grunt) ->

  # Project configuration.
  grunt.initConfig

    # Metadata.
    pkg: grunt.file.readJSON("package.json")
    banner: "/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - " + "<%= grunt.template.today(\"yyyy-mm-dd\") %>\n" + "<%= pkg.homepage ? \"* \" + pkg.homepage + \"\\n\" : \"\" %>" + "* Copyright (c) <%= grunt.template.today(\"yyyy\") %> <%= pkg.author.name %>;" + " Licensed <%= _.pluck(pkg.licenses, \"type\").join(\", \") %> */\n"
    server: "server.coffee"
    shell:
      watch:
        options:
          stdout: true
          stderr: true
        command: "supervisor -e js,coffee,json,jade,html -w app/,config/,lib/,node_modules/,<%= server %> -- <%= server %>"
      production:
        options:
          stdout: true
          stderr: true
        command: "NODE_ENV=production forever start -a -l /tmp/mixtape-server.log -o /tmp/mixtape.log -e /tmp/mixtape-error.log --no-colors <%= server %>"
      production_stop:
        options:
          stdout: true
          stderr: true
        command: "forever stop <%= server %>"


  # These plugins provide necessary tasks.
  grunt.loadNpmTasks "grunt-shell"

  # Default task.
  #grunt.registerTask('default', ['jshint', 'nodeunit', 'concat', 'uglify']);
  grunt.registerTask "watch", ["shell:watch"]
  grunt.registerTask "production", ["shell:production"]
  grunt.registerTask "production:stop", ["shell:production_stop"]
