###global module:false,require:false###
module.exports = (grunt) ->

  grunt.initConfig {
    pkg: '<json:package.json>',

    meta:
      # banner: """/*!
      #   <%= pkg.title || pkg.name %> - v pkg.version
      #   Built: <%= grunt.template.today() %>
      # */\n"""
      timestamp: "<%= grunt.template.today('isoDateTime') %>"

    replace:
      timestampMainJs:
        src: ['./dist/scripts/main.js']
        overwrite: true
        replacements: [{ 
          from: '!{META}',
          to: '<%= JSON.stringify(meta).replace(/"/g, \'\\\\"\') %>'
        }]

    # concat:
    #   default:
    #     src: ['<banner:meta.banner>', 'js/project-*.js']
    #     dest: 'dist/compiled.js'

    # min:
    #   default:
    #     src: ['<banner:meta.banner>', '<config:concat.default.dest>']
    #     dest: 'dist/compiled.min.js'

    coffee:
      compile:
        expand: true
        flatten: false
        cwd: './src'
        src: ['./scripts/**/*.coffee']
        dest: './dist'
        ext: '.js'

    stylus:
      compile: {
        options: {
          # paths: ['path/to/import', 'another/to/import'],
          # urlfunc: 'embedurl', // use embedurl('test.png') in our code to trigger Data URI embedding
          # use: [
          #   #require('fluidity') // use stylus plugin at compile time
          # ],
          # import: [    //  @import 'foo', 'bar/moo', etc. into every .styl file
          # 'foo',       //  that is compiled. These might be findable based on values you gave
          # 'bar/moo'    //  to `paths`, or a plugin you added under `use`
          # ]
          compress: false
          linenos: true
        },
        expand: true
        flatten: false
        cwd: './src'
        src: ['./styles/**/*.styl']
        dest: './dist'
        ext: '.css'
      }

    jade:
      compile: {
        options: {
          debug: true
          pretty: true
          data: require('./src/jade-data')
        },
        expand: true
        flatten: false
        cwd: './src'
        src: ['./**/*.jade']
        dest: './dist'
        ext: '.html'
      }

    watch:
      gruntfile:
          files: __filename
          tasks: ['compile']
      coffee:
        files: './src/<%= coffee.compile.src %>',
        tasks: ['coffee', 'replace:timestampMainJs']
      stylus:
        files: './src/<%= stylus.compile.src %>',
        tasks: ['stylus']
      jade:
        files: './src/<%= jade.compile.src %>',
        tasks: ['jade']
      all:
        files: './src/**/*',
        tasks: ['compile']

  }

  gruntload = require('grunt-load')(grunt)
  gruntload.loadNpmTasks()

  grunt.registerTask('compile-scripts', ['coffee', 'replace:timestampMainJs'])

  grunt.registerTask('compile', ['compile-scripts','stylus','jade']);
  grunt.registerTask('live', ['compile','watch']);

  grunt.registerTask('default', []);

