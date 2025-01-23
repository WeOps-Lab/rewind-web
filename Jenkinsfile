pipeline {
    agent {
        label 'builder'
    }

    options {
        timestamps()
    }

    environment {
        BRANCH_NAME = 'opspilot'
        IMAGE_NAME = "etherfurnace/munchkin-web"
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
                    cp -Rf ./.env.example .env
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

       stage('更新云环境'){
            steps {
                script {
                    sh """
                        cd ${env.KUBE_DIR}/munchkin-web/overlays/cwoa/ && \
                            sudo kubectl delete -k . || true &&\
                            sudo kubectl apply -k .
                    """
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
                        docker pull etherfurnace/opspilot-web
                        docker stop opspilot-web || true
                        docker rm opspilot-web|| true
                        docker run -itd --name opspilot-web --restart always \
                            -v /root/codes/conf/opspilot-web/.env:/apps/.env \
                            --add-host=kube-service.lite:${env.CLOUD_SERVER}  \
                            --network lite \
                            etherfurnace/munchkin-web
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
