pipeline {
    agent {
        label 'builder'
    }

    options {
        timestamps()
    }

    environment {
        BRANCH_NAME = 'monitor-manager'
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
                    rm -Rf ./src/app/example
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
            agent { 
                label 'docker' 
            }
            options {
                skipDefaultCheckout true
            }
            steps {
                script {
                    sh """
                       docker pull ${IMAGE_NAME}:${IMAGE_TAG}
                       docker stop monitor-web || true
                       docker rm monitor-web || true
                       docker run -itd --name monitor-web --restart always \
                            -v /root/codes/conf/monitor-web/.env:/app/.env.local \
                            --network lite \
                            etherfurnace/monitor-manager-web
                    """
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