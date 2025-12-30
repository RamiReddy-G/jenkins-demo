pipeline {
    agent any

    environment {
        IMAGE_NAME = "reddy1753421/jenkins-demo-app"
        BLUE_PORT  = "3000"
        GREEN_PORT = "3001"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/RamiReddy-G/jenkins-demo.git'
            }
        }

        stage('Build & Push Image') {
            steps {
                sh '''
                  docker build -t $IMAGE_NAME:${BUILD_NUMBER} .
                  docker tag $IMAGE_NAME:${BUILD_NUMBER} $IMAGE_NAME:latest
                  docker push $IMAGE_NAME:${BUILD_NUMBER}
                  docker push $IMAGE_NAME:latest
                '''
            }
        }

        stage('Detect Active Color') {
            steps {
                script {
                    def activePort = sh(
                        script: "grep server /etc/nginx/conf.d/upstream.conf | grep -o '[0-9]*'",
                        returnStdout: true
                    ).trim()

                    if (activePort == BLUE_PORT) {
                        env.ACTIVE_COLOR = "blue"
                        env.INACTIVE_COLOR = "green"
                        env.INACTIVE_PORT = GREEN_PORT
                    } else {
                        env.ACTIVE_COLOR = "green"
                        env.INACTIVE_COLOR = "blue"
                        env.INACTIVE_PORT = BLUE_PORT
                    }

                    echo "ACTIVE_COLOR   = ${env.ACTIVE_COLOR}"
                    echo "INACTIVE_COLOR = ${env.INACTIVE_COLOR}"
                    echo "INACTIVE_PORT  = ${env.INACTIVE_PORT}"
                }
            }
        }

        stage('Deploy to Inactive Color') {
            steps {
                sh '''
                  docker stop app-${INACTIVE_COLOR} || true
                  docker rm app-${INACTIVE_COLOR} || true

                  docker run -d \
                    --name app-${INACTIVE_COLOR} \
                    -p ${INACTIVE_PORT}:3000 \
                    $IMAGE_NAME:latest
                '''
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                  sleep 10
                  curl -f http://localhost:${INACTIVE_PORT}
                '''
            }
        }

        stage('Switch Traffic') {
            steps {
                sh '''
                  sudo sed -i "s/${BLUE_PORT}/${INACTIVE_PORT}/g" /etc/nginx/conf.d/upstream.conf
                  sudo systemctl reload nginx
                '''
            }
        }
    }

    post {
        success {
            echo "✅ Blue-Green Deployment Successful — Zero Downtime"
        }

        failure {
            echo "❌ Deployment failed — traffic NOT switched"
        }
    }
}
