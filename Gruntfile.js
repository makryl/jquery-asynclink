module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> v<%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd") %>) */\n'
            },
            js: {
                src: 'asynclink.jquery.js',
                dest: 'asynclink.jquery.min.js'
            }
        },

        compress: {
            js: {
                options: {
                    mode: 'gzip'
                },
                src: 'asynclink.jquery.min.js',
                dest: 'asynclink.jquery.min.js.gz'
            }
        },

        file_info: {
            source_files: {
                src: [
                    'asynclink.jquery.js',
                    'asynclink.jquery.min.js',
                    'asynclink.jquery.min.js.gz'
                ],
                options: {
                    inject: {
                        dest: 'README.md',
                        text: '* [asynclink.jquery.js](asynclink.jquery.js) ' +
                            '({{= sizeText(size(src[0])) }})' +
                            '\n* [asynclink.jquery.min.js](asynclink.jquery.min.js) ' +
                            '({{= sizeText(size(src[1])) }}, gzipped {{= sizeText(size(src[2])) }})'
                    }
                }
            }
        },

        replace: {
            readme: {
                options: {
                    patterns: [
                        {
                            match: /version \*\*.*\*\* \(.*\)/,
                            replacement: 'version **<%= pkg.version %>** (<%= grunt.template.today("yyyy-mm-dd") %>)'
                        }
                    ]
                },
                files: [
                    {
                        src: 'README.md',
                        dest: 'README.md'
                    }
                ]
            },
            example: {
                options: {
                    patterns: [
                        {
                            match: /<!-- Example -->/,
                            replacement: '<%= grunt.file.read("tpl/example.tpl.html") %>'
                        }
                    ]
                },
                files: [
                    {
                        src: 'index.html',
                        dest: 'index.html'
                    }
                ]
            }
        },

        markdown: {
            index: {
                options: {
                    template: 'tpl/index.tpl.html',
                    markdownOptions: {
                        highlight: 'auto'
                    }
                },
                files: [
                    {
                        src: 'README.md',
                        dest: 'index.html'
                    }
                ]
            }
        },

        clean: [
            "asynclink.jquery.min.js.gz"
        ],

        bump: {
            options: {
                pushTo: 'origin',
                commitFiles: ['.'],
                updateConfigs: ['pkg']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-file-info');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-markdown');
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-npm');

    grunt.registerTask('default', [
        'bump-only:prerelease',
        'build'
    ]);

    grunt.registerTask('build', [
        'uglify',
        'compress',
        'file_info',
        'replace:readme',
        'markdown',
        'replace:example',
        'clean'
    ]);

    grunt.registerTask('release', function (type) {
        grunt.task.run('bump-only:' + (type || 'patch'));
        grunt.task.run('build');
        grunt.task.run('bump-commit');
        grunt.task.run('npm-publish');
    });

};
