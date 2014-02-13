module.exports = function(grunt)
{
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.initConfig
    ({
        srcDir: 'site/src',
        distDir: 'site/dist',
        tempDir: 'site/temp',
        sass:{
            dist:{
                options:{
                    style: 'compressed'
                },
                files:{
                    '<%= distDir %>/css/main.css': '<%= srcDir %>/scss/main.scss'
                }
            }
        },
        copy: {
            html: {
                expand:true,
                cwd:'<%= srcDir %>',
                src: ['**/*.html'],
                dest: '<%= distDir %>'
            },
            data: {
                expand:true,
                cwd:'<%= srcDir %>',
                src: ['data/*.json'],
                dest: '<%= distDir %>'
            },
            fonts: {
                expand:true,
                cwd:'<%= srcDir %>',
                src: ['fonts/**/*.eot','fonts/**/*.woff','fonts/**/*.ttf','fonts/**/*.svg'],
                dest: '<%= distDir %>'
            },
            misc_files: {
                expand:true,
                cwd:'<%= srcDir %>',
                src: ['favicon.ico','apple-touch-icon-precomposed.png','robots.txt'],
                dest: '<%= distDir %>'
            },
            scripts_to_dist: {
                expand:true,
                cwd:'<%= srcDir %>',
                src: ['**/*.js'],
                dest: '<%= distDir %>'
            },
            scripts_to_temp: {
                expand:true,
                cwd:'<%= srcDir %>',
                src: ['**/*.js'],
                dest: '<%= tempDir %>'
            }
        },
        clean: {
            on_start: ['<%= distDir %>'],
            on_finish: ['<%= tempDir %>']
        },
        requirejs: {
            compile: {
                options: {
                    keepBuildDir: true,
                    removeCombined: true,
                    generateSourceMaps:false,
                    optimize: 'uglify2',
                    uglify2: {
                        mangle:true
                    },
                    preserveLicenseComments: false,
                    baseUrl: '<%= tempDir %>/js',
                    dir:'<%= distDir %>/js',
                    paths: {
                        'backbone': 'lib/backbone-1.1.0.min',
                        'jquery': 'lib/jquery-1.10.2.min',
                        'lodash': 'lib/lodash-2.4.0.min',
                        'd3': 'lib/d3.v3.min'
                    },
                    shim: {
                        'backbone': {
                            deps: ['lodash', 'jquery'],
                            exports: 'Backbone'
                        }
                    },
                    modules: [
                        {
                            name: 'main'
                        },
                        {
                            name: 'views/basic-info',
                            exclude: [
                                'jquery',
                                'lodash',
                                'backbone',
                                'i18n'
                            ]
                        },
                        {
                            name: 'views/ranking',
                            exclude: [
                                'jquery',
                                'lodash',
                                'backbone',
                                'i18n'
                            ]
                        },
                        {
                            name: 'views/results',
                            exclude: [
                                'jquery',
                                'lodash',
                                'backbone',
                                'i18n'
                            ]
                        }
                    ]
                }
            }
        },
        watch: {
            gruntFile: {
                files: ['Gruntfile.js'],
                tasks: ['watch'],
                options: {
                    nospawn: false
                }
            },
            sass: {
                files: ['<%= srcDir %>/scss/**/*.scss'],
                tasks: ['sass'],
                options: {
                    nospawn: false
                }
            },
            scripts: {
                files: ['<%= srcDir %>/**/*.js'],
                tasks: ['scripts_to_dist'],
                options: {
                    nospawn: false
                }
            },
            html: {
                files: ['<%= srcDir %>/**/*.html'],
                tasks: ['copy:html'],
                options: {
                    nospawn: false
                }
            },
            data: {
                files: ['<%= srcDir %>/data/**/*.json'],
                tasks: ['copy:data'],
                options: {
                    nospawn: false
                }
            }
        }
    });

    grunt.registerTask('default', [
        'clean:on_start',
        'copy:html',
        'copy:data',
        'copy:fonts',
        'copy:misc_files',
        'copy:scripts_to_temp',
        'requirejs',
        'sass',
        'clean:on_finish'
    ]);
    grunt.registerTask('heroku', ['default']);
    grunt.registerTask('dev', [
        'clean:on_start',
        'copy:html',
        'copy:data',
        'copy:fonts',
        'copy:misc_files',
        'copy:scripts_to_dist',
        'sass',
        'clean:on_finish'
    ]);
};