stage('Deploy to EC2') {
    steps {
        withCredentials([string(
            credentialsId: 'ec2-ssh-key-text',
            variable: 'SSH_KEY_TEXT'
        )]) {

            bat """
            echo %SSH_KEY_TEXT% > ec2_key.pem

            icacls ec2_key.pem /inheritance:r
            icacls ec2_key.pem /grant:r "SYSTEM:R"

            ssh -i ec2_key.pem -o StrictHostKeyChecking=no jenkins@13.60.203.224 ^
            "docker stop backend-app || true && \
             docker rm backend-app || true && \
             docker pull reddy1753421/jenkins-demo-app:latest && \
             docker run -d -p 3000:3000 --name backend-app reddy1753421/jenkins-demo-app:latest"
            """
        }
    }
}
