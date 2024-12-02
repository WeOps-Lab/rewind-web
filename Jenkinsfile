pipeline {
    agent {
        label 'builder'
    }

    options {
        timestamps()
    }

    environment {
        BRANCH_NAME = 'system-manager'
        IMAGE_NAME = "etherfurnace/${BRANCH_NAME}-web"
        IMAGE_TAG='latest'
    }

    stages {
        stage('构建前通知'){
           steps {
                sh """
                    curl '${env.NOTIFICATION_URL}' \
                    -H 'Content-Type: application/json' \
                    -d '{
                        "msgtype": "text",
                        "text": {
                            "content": "[${BRANCH_NAME}-web]: 🚀 开始构建"
                        }
                    }'
                """
           }
        }

        stage('克隆代码仓库') {
            steps {
                git url: 'https://github.com/WeOps-Lab/rewind-web', branch: BRANCH_NAME
            }
       }

       stage('构建镜像') {
            steps {
                script {
                    sh """
                    sudo docker build -f ./Dockerfile -t ${IMAGE_NAME}:${IMAGE_TAG} .
                    """
                }
            }
       }

       stage('推送镜像'){
            steps {
                script {
                    sh "sudo docker push  ${IMAGE_NAME}:${IMAGE_TAG}"
                }
            }
       }

       stage('更新环境'){
            steps {
                script {
                    sh "echo 1"
                    // sh "ansible ${env.ANSIBLE_HOST}  -m shell -a 'chdir=${env.KUBE_DIR}/user-manager/overlays/lite sudo kubectl delete -k . && sudo kubectl apply -k .'"
                }
            }
       }
    }

    post {
        success {
            sh """
                curl '${env.NOTIFICATION_URL}' \
                -H 'Content-Type: application/json' \
                -d '{
                    "msgtype": "text",
                    "text": {
                        "content": "[${BRANCH_NAME}-web]: 🎉 构建成功"
                    }
                }'
            """
        }
        failure {
            sh """
                curl '${env.NOTIFICATION_URL}' \
                -H 'Content-Type: application/json' \
                -d '{
                    "msgtype": "text",
                    "text": {
                        "content": "[${BRANCH_NAME}-web]: ❌ 构建失败"
                    }
                }'
            """
        }
    }
}