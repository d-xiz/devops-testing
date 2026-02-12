def runCmd(cmd) {
  if (isUnix()) {
    sh cmd
  } else {
    bat cmd
  }
}

pipeline {
  agent any

  options {
    disableConcurrentBuilds()
    timestamps()
  }
  triggers {
    pollSCM('H/2 * * * *')
  }

  environment {
    APP_NAME = 'chess-club'
    IMAGE_NAME = 'chess-club-app'
    IMAGE_TAG  = "${BUILD_NUMBER}"
    CONTAINER_PORT = '5000'
    NODE_PORT = '30080'
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install Dependencies') {
      steps {
        script {
          runCmd('npm install')
        }
      }
    }

    stage('Backend Tests') {
      steps {
        script {
          runCmd('npm test')
          runCmd('npm run test-frontend')
        }
      }
    }

    stage('Build Docker Image') {
      steps {
        script {
          runCmd("docker build --no-cache -t ${IMAGE_NAME}:${IMAGE_TAG} .")
        }
      }
    }

    stage('Start Minikube') {
      steps {
        script {
           runCmd('minikube start')
        }
      }
    }

    stage('Load Image into Minikube') {
      steps {
        script {
          runCmd("minikube image load ${IMAGE_NAME}:${IMAGE_TAG}")

        }
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        script {
          runCmd('kubectl apply -f deployment.yaml')
          runCmd("kubectl set image deployment/chess-club-deploy chess-club=${IMAGE_NAME}:${IMAGE_TAG}")
          runCmd('kubectl apply -f service.yaml')
          runCmd('kubectl get pods')
          runCmd('kubectl get services')
        }
      }
    }

    stage('Wait for Pods') {
      steps {
        script {
          runCmd('kubectl rollout status deployment/chess-club-deploy')
        }
      }
    }

    stage('Smoke Test (NodePort)') {
  steps {
    bat 'minikube service chess-club-service --url'
  }
}
  }
  post {
      always {
      archiveArtifacts artifacts: 'coverage/**', fingerprint: true
    }
    success {
       echo "Build SUCCESS"

       emailext(
        from: 'Chess Club CI <chessclub@gmail.com>',
      to: 'danishmohamed2003@gmail.com',
      subject: "SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
     body: """
        <h3>Build Successful</h3>
        <p><b>Project:</b> ${env.JOB_NAME}</p>
        <p><b>Build Number:</b> ${env.BUILD_NUMBER}</p>
        <p><b>Status:</b> SUCCESS</p>
        <p><b>URL:</b> <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
      """,
      mimeType: 'text/html'
    )
    }

    failure {
       echo "Build FAILED"
       emailext(
        from: 'Chess Club CI <chessclub@gmail.com>',
      to: 'danishmohamed2003@gmail.com',
      subject: "FAILURE: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
      body: """
        <h3>Build Failed</h3>
        <p><b>Project:</b> ${env.JOB_NAME}</p>
        <p><b>Build Number:</b> ${env.BUILD_NUMBER}</p>
        <p><b>Status:</b> FAILED</p>
        <p><b>URL:</b> <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
        <p><b>Console log is attached for debugging.</b></p>
      """,
      mimeType: 'text/html',
      attachLog: true,
      compressLog: true
    )
  }
}
}
