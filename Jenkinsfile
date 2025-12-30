pipeline {
    agent any

    environment {
        IMAGE = "reddy1753421/jenkins-demo-app"
        NGINX_UPSTREAM = "/etc/nginx/conf.d/upstream.conf"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build & Push Image') {
            steps {
                sh """
                docker build -t ${IMAGE}:${BUILD_NUMBER} .
                docker tag ${IMAGE}:${BUILD_NUMBER} ${IMAGE}:latest
                docker push ${IMAGE}:${BUILD_NUMBER}
                docker push ${IMAGE}:latest
                """
            }
        }

        stage('Detect Active Port') {
    steps {
        script {
            def activePort = sh(
                script: "grep -o ':[0-9]*' ${NGINX_UPSTREAM} | tr -d ':'",
                returnStdout: true
            ).trim()

            if (!activePort) {
                activePort = "3000"
            }

            env.ACTIVE_PORT = activePort
            env.INACTIVE_PORT = (activePort == "3000") ? "3001" : "3000"

            echo "ACTIVE_PORT   = ${env.ACTIVE_PORT}"
            echo "INACTIVE_PORT = ${env.INACTIVE_PORT}"
        }
    }
}


        stage('Deploy to Inactive Port') {
            steps {
                sh """
                echo "Stopping anything running on port ${INACTIVE_PORT} (if exists)..."

                docker ps -q --filter "publish=${INACTIVE_PORT}" | xargs -r docker stop
                docker ps -aq --filter "publish=${INACTIVE_PORT}" | xargs -r docker rm

                docker run -d \
                  --name app-${INACTIVE_PORT} \
                  -p ${INACTIVE_PORT}:3000 \
                  ${IMAGE}:latest
                """
            }
        }

        stage('Health Check') {
            steps {
                sh """
                echo "Waiting for app to start..."
                sleep 10

                curl -f http://localhost:${INACTIVE_PORT}
                """
            }
        }

        stage('Switch Traffic') {
            steps {
                sh """
                sudo sed -i "s/${ACTIVE_PORT}/${INACTIVE_PORT}/" ${NGINX_UPSTREAM}
                sudo nginx -t
                sudo systemctl reload nginx
                """
            }
        }
    }

    post {
        success {
            echo "✅ Blue-Green deployment SUCCESSFUL"
            echo "Traffic switched to port ${INACTIVE_PORT}"
        }

        failure {
            echo "❌ Deployment FAILED — traffic NOT switched"
        }
    }
}
