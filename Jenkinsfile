node {

    stage('Checkout') {
        checkout scm
    }

    stage('Build Docker Image') {
        bat 'docker build -t reddy1753421/jenkins-demo-app:%BUILD_NUMBER% .'
    }

    stage('Docker Login') {
        withCredentials([string(credentialsId: 'dockerhub-password', variable: 'DOCKER_PASS')]) {
            bat 'echo %DOCKER_PASS% | docker login -u reddy1753421 --password-stdin'
        }
    }

    stage('Push Docker Image') {
        bat 'docker push reddy1753421/jenkins-demo-app:%BUILD_NUMBER%'
        bat 'docker tag reddy1753421/jenkins-demo-app:%BUILD_NUMBER% reddy1753421/jenkins-demo-app:latest'
        bat 'docker push reddy1753421/jenkins-demo-app:latest'
    }

    stage('Deploy to EC2') {
        withCredentials([string(credentialsId: 'ec2-ssh-key-text', variable: 'SSH_KEY_TEXT')]) {

            bat '''
            echo %SSH_KEY_TEXT% > ec2_key.pem

            icacls ec2_key.pem /inheritance:r
            icacls ec2_key.pem /grant:r "SYSTEM:R"

            ssh -i ec2_key.pem -o StrictHostKeyChecking=no jenkins@13.60.203.224 ^
            "docker stop backend-app || true && \
             docker rm backend-app || true && \
             docker pull reddy1753421/jenkins-demo-app:latest && \
             docker run -d -p 3000:3000 --name backend-app reddy1753421/jenkins-demo-app:latest"
            '''
        }
    }

}
