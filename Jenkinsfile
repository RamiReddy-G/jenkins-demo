pipeline {
    agent any

    environment {
        IMAGE_NAME = "reddy1753421/jenkins-demo-app"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/RamiReddy-G/jenkins-demo.git'
            }
        }

        stage('Build & Push Image') {
            steps {
                sh '''
                  docker build -t $IMAGE_NAME:$BUILD_NUMBER .
                  docker tag $IMAGE_NAME:$BUILD_NUMBER $IMAGE_NAME:latest
                  docker push $IMAGE_NAME:$BUILD_NUMBER
                  docker push $IMAGE_NAME:latest
                '''
            }
        }

        stage('Detect Active Color') {
            steps {
                script {
                    def active = sh(
                        script: "grep server /etc/nginx/conf.d/upstream.conf",
                        returnStdout: true
                    ).trim()

                    if (active.contains("3000")) {
                        env.ACTIVE_COLOR = "blue"
                        env.INACTIVE_COLOR = "green"
                        env.INACTIVE_PORT = "3001"
                    } else {
                        env.ACTIVE_COLOR = "green"
                        env.INACTIVE_COLOR = "blue"
                        env.INACTIVE_PORT = "3000"
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
                script {
                    try {
                        sh '''
                          sleep 10
                          curl -f http://localhost:${INACTIVE_PORT}
                        '''
                        echo "✅ Health check passed"
                    } catch (err) {
                        echo "❌ Health check failed — rolling back"

                        sh '''
                          docker stop app-${INACTIVE_COLOR} || true
                          docker rm app-${INACTIVE_COLOR} || true
                        '''

                        error("Rollback completed. Deployment aborted.")
                    }
                }
            }
        }

        stage('Switch Traffic') {
            steps {
                sh '''
                  sudo sed -i "s/3000/3001/" /etc/nginx/conf.d/upstream.conf || true
                  sudo sed -i "s/3001/${INACTIVE_PORT}/" /etc/nginx/conf.d/upstream.conf

                  sudo nginx -t
                  sudo systemctl reload nginx
                '''
            }
        }
    }

    post {
        success {
            echo "✅ Deployment successful — zero downtime achieved"
        }
        failure {
            echo "❌ Deployment failed — automatic rollback executed"
        }
    }
}
