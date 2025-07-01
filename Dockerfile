# Install dependencies
FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Build the Next.js app
FROM deps AS builder
WORKDIR /app
COPY . .
RUN npm run build

# Production image with SSH
FROM node:22-slim AS runner
WORKDIR /app

# Install production dependencies and SSH server
COPY --from=deps /app/node_modules ./node_modules
RUN apt-get update \
 && apt-get install -y openssh-server \
 && mkdir /var/run/sshd

# Copy build artifacts
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/package.json ./package.json

# Configure SSH: set root password and permit root login
RUN echo "root:Docker!" | chpasswd \
 && sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config \
 && sed -i 's@session\s*required\s*pam_loginuid.so@session optional pam_loginuid.so@' /etc/pam.d/sshd

# Expose both HTTP and SSH ports
EXPOSE 3000 2222

ENV NODE_ENV=production

# Start SSHD then launch Next.js
CMD service ssh start \
 && npm run start
