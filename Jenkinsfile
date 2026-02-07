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

  environment {
    APP_NAME = 'chess-club'
    IMAGE_NAME = 'chess-club-app'
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
        }
      }
    }

    stage('Frontend Tests') {
      steps {
        script {
          runCmd('npm run test-frontend')
        }
      }
    }

    stage('Build Docker Image') {
      steps {
        script {
          runCmd("docker build -t ${IMAGE_NAME} .")
        }
      }
    }

    stage('Start Minikube') {
      steps {
        script {
           runCmd('minikube start --ports=127.0.0.1:30080:30080')
        }
      }
    }

    stage('Load Image into Minikube') {
      steps {
        script {
          runCmd("minikube image load ${IMAGE_NAME}")
        }
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        script {
          runCmd('kubectl delete deployment chess-club-deploy --ignore-not-found')
          runCmd('kubectl apply -f deployment.yaml')
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

    stage('Smoke Test (HTTP)') {
      steps {
        script {
          if (isUnix()) {
            sh """
              kubectl port-forward svc/chess-club-service ${NODE_PORT}:5000 &
              PID=\$!
              sleep 5
              curl -f http://127.0.0.1:${NODE_PORT} || exit 1
              kill \$PID
            """
          } else {
            bat """
              start /B kubectl port-forward svc/chess-club-service ${NODE_PORT}:5000 &
              timeout /t 5 > NUL
              powershell -Command "Invoke-WebRequest http://127.0.0.1:${NODE_PORT} -UseBasicParsing"
            """
          }
        }
      }
    }
    stage('Verify Environment') {
  steps {
    bat '''
      kubectl get pods
      kubectl exec deploy/chess-club-deploy -- printenv NODE_ENV
    '''
  }
}

    stage('Verify Status Endpoint') {
  steps {
    bat '''
      echo Checking /status endpoint...
      powershell -Command "Invoke-WebRequest http://localhost:30080/status -UseBasicParsing"
    '''
  }
}

  }
  post {
    success {
      echo "✅ Pipeline completed successfully"
    }

    failure {
      echo "❌ Pipeline failed"
    }

    always {
      archiveArtifacts artifacts: 'coverage/**', fingerprint: true
    }
  }
}
