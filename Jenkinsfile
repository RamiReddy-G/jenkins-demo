pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo 'Code checked out from GitHub'
            }
        }

        stage('Run App') {
            steps {
                bat 'node app.js'
            }
        }
    }
}
