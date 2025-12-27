pipeline {
    agent any

    environment {
        IMAGE_NAME = "reddy1753421/jenkins-demo-app"
        IMAGE_TAG  = "latest"
        EC2_USER   = "jenkins"
        EC2_HOST   = "13.60.203.224"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                bat "docker build -t %IMAGE_NAME%:%BUILD_NUMBER% ."
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([
                    string(credentialsId: 'dockerhub-password', variable: 'DOCKER_PASS')
                ]) {
                    bat """
                        echo %DOCKER_PASS% | docker login -u reddy1753421 --password-stdin
                    """
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                bat """
                    docker push %IMAGE_NAME%:%BUILD_NUMBER%
                    docker tag %IMAGE_NAME%:%BUILD_NUMBER% %IMAGE_NAME%:%IMAGE_TAG%
                    docker push %IMAGE_NAME%:%IMAGE_TAG%
                """
            }
        }

        stage('Deploy to EC2') {
            steps {
                sshagent(credentials: ['ec2-ssh-key']) {
                    bat """
                        ssh -o StrictHostKeyChecking=no %EC2_USER%@%EC2_HOST% ^
                        "docker stop backend-app || true && \
                         docker rm backend-app || true && \
                         docker pull %IMAGE_NAME%:%IMAGE_TAG% && \
                         docker run -d -p 3000:3000 --name backend-app %IMAGE_NAME%:%IMAGE_TAG%"
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ Deployment successful"
        }
        failure {
            echo "❌ Deployment failed"
        }
    }
}
