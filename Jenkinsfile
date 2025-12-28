pipeline {
    agent any

    environment {
        IMAGE = "reddy1753421/jenkins-demo-app"
        TAG   = "${BUILD_NUMBER}"
        ACTIVE_COLOR_FILE = "/etc/nginx/conf.d/upstream.conf"
    }

    stages {

        // ✅ DO NOT add another checkout stage

        stage('Build & Push Image') {
            steps {
                sh """
                docker build -t $IMAGE:$TAG .
                docker tag $IMAGE:$TAG $IMAGE:latest
                docker push $IMAGE:$TAG
                docker push $IMAGE:latest
                """
            }
        }

        stage('Detect Active Color') {
            steps {
                script {
                    def upstream = sh(
                        script: "grep server $ACTIVE_COLOR_FILE",
                        returnStdout: true
                    )

                    env.NEW_PORT = upstream.contains("3000") ? "3001" : "3000"
                }
            }
        }

        stage('Deploy to Inactive Color') {
            steps {
                sh """
                docker stop app-$NEW_PORT || true
                docker rm app-$NEW_PORT || true
                docker run -d \
                  --name app-$NEW_PORT \
                  -p $NEW_PORT:3000 \
                  $IMAGE:latest
                """
            }
        }

        stage('Health Check') {
            steps {
                sh "curl -f http://localhost:$NEW_PORT"
            }
        }

        stage('Switch Traffic') {
            steps {
                sh """
                echo "upstream backend { server 127.0.0.1:$NEW_PORT; }" | sudo tee $ACTIVE_COLOR_FILE
                sudo nginx -t
                sudo systemctl reload nginx
                """
            }
        }
    }

    post {
        failure {
            echo "❌ Deployment failed — traffic NOT switched"
        }
        success {
            echo "✅ Blue-Green deployment completed"
        }
    }
}
