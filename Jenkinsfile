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
          runCmd("docker build --no-cache -t ${IMAGE_NAME} .")
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
      kubectl logs deploy/chess-club-deploy
    '''
  }
}

 stage('Verify Status Endpoint') {
  steps {
    script {
      bat """
        @echo off
        :: Force kill any existing port-forwards to free up port 30080
        taskkill /IM kubectl.exe /F 2>nul

        echo Starting Tunnel...
        start /B kubectl port-forward svc/chess-club-service 30080:5000

        echo Waiting for tunnel to stabilize (10 seconds)...
        ping 127.0.0.1 -n 10 > nul

        echo Checking /status endpoint...
        powershell -Command "try { \$r = Invoke-WebRequest http://127.0.0.1:30080/status -UseBasicParsing; if(\$r.StatusCode -eq 200) { echo 'SUCCESS'; exit 0 } else { exit 1 } } catch { echo 'Failed to reach /status'; exit 1 }"

        echo Cleaning up tunnel...
        taskkill /IM kubectl.exe /F 2>nul
      """
    }
  }
}

  }
  post {
    success {
       emailext(
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
       emailext(
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

    always {
      archiveArtifacts artifacts: 'coverage/**', fingerprint: true
    }
  }
}
}
