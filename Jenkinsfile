pipeline {
    agent any

    environment {
        IMAGE_NAME = "reddy1753421/jenkins-demo-app"
        IMAGE_TAG  = "${BUILD_NUMBER}"
        EC2_HOST   = "<EC2_PUBLIC_IP>"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                bat "docker build -t %IMAGE_NAME%:%IMAGE_TAG% ."
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    bat "echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin"
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                retry(3) {
                    bat "docker push %IMAGE_NAME%:%IMAGE_TAG%"
                    bat "docker tag %IMAGE_NAME%:%IMAGE_TAG% %IMAGE_NAME%:latest"
                    bat "docker push %IMAGE_NAME%:latest"
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                withCredentials([sshUserPrivateKey(
                    credentialsId: 'ec2-ssh-key',
                    keyFileVariable: 'SSH_KEY'
                )]) {
                    bat """
                    ssh -i %SSH_KEY% -o StrictHostKeyChecking=no jenkins@%EC2_HOST% ^
                    "docker stop backend-app || true && ^
                     docker rm backend-app || true && ^
                     docker pull %IMAGE_NAME%:latest && ^
                     docker run -d -p 3000:3000 --name backend-app %IMAGE_NAME%:latest"
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ CI/CD Pipeline completed successfully. App deployed to EC2."
        }
        failure {
            echo "❌ Pipeline failed. Check logs."
        }
    }
}
