pipeline {
    agent any

    environment {
        IMAGE = "reddy1753421/jenkins-demo-app"
    }

    stages {

        stage('Build & Push Image') {
            steps {
                sh """
                docker build -t \$IMAGE:\$BUILD_NUMBER .
                docker tag \$IMAGE:\$BUILD_NUMBER \$IMAGE:latest
                docker push \$IMAGE:\$BUILD_NUMBER
                docker push \$IMAGE:latest
                """
            }
        }

        stage('Detect Active Port') {
            steps {
                script {
                    def active = sh(
                        script: "grep server /etc/nginx/conf.d/upstream.conf | grep -o '[0-9]\\+'",
                        returnStdout: true
                    ).trim()

                    if (active == "3000") {
                        env.ACTIVE_PORT = "3000"
                        env.INACTIVE_PORT = "3001"
                    } else {
                        env.ACTIVE_PORT = "3001"
                        env.INACTIVE_PORT = "3000"
                    }

                    echo "ACTIVE_PORT   = ${env.ACTIVE_PORT}"
                    echo "INACTIVE_PORT = ${env.INACTIVE_PORT}"
                }
            }
        }

        stage('Deploy to Inactive Port') {
            steps {
                sh """
                docker stop app-\$INACTIVE_PORT || true
                docker rm app-\$INACTIVE_PORT || true

                docker run -d \
                  --name app-\$INACTIVE_PORT \
                  -p \$INACTIVE_PORT:3000 \
                  \$IMAGE:latest
                """
            }
        }

        stage('Health Check') {
            steps {
                sh """
                sleep 10
                curl -f http://localhost:\$INACTIVE_PORT
                """
            }
        }

        stage('Switch Traffic') {
            steps {
                sh """
                sudo sed -i "s/${env.ACTIVE_PORT}/${env.INACTIVE_PORT}/" /etc/nginx/conf.d/upstream.conf
                sudo nginx -t
                sudo systemctl reload nginx
                """
            }
        }
    }

    post {
        success {
            echo "✅ Blue-Green deployment successful"
        }
        failure {
            echo "❌ Deployment failed — traffic unchanged"
        }
    }
}
