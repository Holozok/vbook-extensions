const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Đọc thông tin repo từ .git/config
 */
function getRepoConfig() {
  const rootDir = __dirname;
  const gitConfigPath = path.join(rootDir, '.git', 'config');
  
  let config = {
    repoOwner: '',           
    repoName: '',            
    branch: ''               
  };
  
  try {
    // Đọc file .git/config
    if (fs.existsSync(gitConfigPath)) {
      const configContent = fs.readFileSync(gitConfigPath, 'utf8');
      
      // Tìm URL của remote "origin"
      // Hỗ trợ cả định dạng: https://github.com/owner/repo.git và git@github.com:owner/repo.git
      const originMatch = configContent.match(/\[remote\s+"origin"\]([\s\S]*?)(?=\[|$)/);
      
      if (originMatch) {
        const originSection = originMatch[1];
        
        // Lấy URL từ dòng url = ...
        const urlMatch = originSection.match(/url\s*=\s*(.+?)(?:\r?\n|$)/);
        
        if (urlMatch) {
          const url = urlMatch[1].trim();
          
          // Phân tích URL HTTPS: https://github.com/owner/repo.git
          const httpsMatch = url.match(/https:\/\/github\.com\/([^/]+)\/(.+?)(?:\.git)?$/);
          
          // Phân tích URL SSH: git@github.com:owner/repo.git
          const sshMatch = url.match(/git@github\.com:([^/]+)\/(.+?)(?:\.git)?$/);
          
          if (httpsMatch) {
            config.repoOwner = httpsMatch[1];
            config.repoName = httpsMatch[2].replace('.git', '');
          } else if (sshMatch) {
            config.repoOwner = sshMatch[1];
            config.repoName = sshMatch[2].replace('.git', '');
          }
        }
      }
      
      // Tìm branch mặc định từ [branch "master"]
      const branchMatch = configContent.match(/\[branch\s+"([^"]+)"\]/);
      if (branchMatch) {
        config.branch = branchMatch[1];
      }
    }
    
    // Cố gắng lấy branch hiện tại từ git command (để chính xác hơn)
    try {
      config.branch = execSync('git rev-parse --abbrev-ref HEAD', { 
        cwd: rootDir,
        encoding: 'utf8'
      }).trim();
    } catch (error) {
      // Nếu lỗi, sử dụng giá trị từ .git/config
    }
  } catch (error) {
    console.warn('⚠️  Không thể đọc cấu hình git, sử dụng giá trị mặc định');
  }
  
  return config;
}

const CONFIG = getRepoConfig();

/**
 * Hợp nhất các file plugin.json từ các thư mục con vào plugin.json chính
 */
function mergePlugins() {
  const rootDir = __dirname;
  const mainPluginPath = path.join(rootDir, 'plugin.json');
  const extensionsDir = path.join(rootDir, 'extensions');
  
  // Đọc file plugin.json chính
  let mainPlugin = JSON.parse(fs.readFileSync(mainPluginPath, 'utf8'));
  
  // Nếu chưa có mảng data, khởi tạo
  if (!mainPlugin.data) {
    mainPlugin.data = [];
  }
  
  // Quét các thư mục extension trong /extensions
  const dirs = fs.existsSync(extensionsDir) ? fs.readdirSync(extensionsDir) : [];
  
  dirs.forEach(dir => {
    const dirPath = path.join(extensionsDir, dir);
    const stat = fs.statSync(dirPath);
    
    // Chỉ xử lý thư mục
    if (!stat.isDirectory()) {
      return;
    }
    
    const pluginPath = path.join(dirPath, 'plugin.json');
    
    // Kiểm tra tồn tại file plugin.json
    if (!fs.existsSync(pluginPath)) {
      return;
    }
    
    try {
      const subPlugin = JSON.parse(fs.readFileSync(pluginPath, 'utf8'));
      
      // Kiểm tra metadata tồn tại
      if (!subPlugin.metadata) {
        console.warn(`⚠️  ${dir}/plugin.json không có metadata`);
        return;
      }
      
      const metadata = subPlugin.metadata;
      
      // Kiểm tra xem plugin này đã tồn tại chưa (dựa trên name)
      const existingIndex = mainPlugin.data.findIndex(
        item => item.name && item.name.toLowerCase() === (metadata.name || '').toLowerCase()
      );
      
      // Tạo object plugin theo định dạng chính
      const pluginData = {
        name: metadata.name || dir,
        author: metadata.author || '',
        path: `https://raw.githubusercontent.com/${CONFIG.repoOwner}/${CONFIG.repoName}/refs/heads/${CONFIG.branch}/extensions/${dir}/plugin.zip`,
        version: metadata.version || 1,
        source: metadata.source || '',
        icon: `https://raw.githubusercontent.com/${CONFIG.repoOwner}/${CONFIG.repoName}/${CONFIG.branch}/extensions/${dir}/icon.png`,
        description: metadata.description || '',
        type: metadata.type || 'comic',
        locale: metadata.locale || 'en',
        tag: metadata.tag || ''
      };
      
      if (existingIndex !== -1) {
        // Cập nhật plugin hiện tại
        mainPlugin.data[existingIndex] = pluginData;
        console.log(`✓ Cập nhật: ${metadata.name}`);
      } else {
        // Thêm plugin mới
        mainPlugin.data.push(pluginData);
        console.log(`✓ Thêm mới: ${metadata.name}`);
      }
    } catch (error) {
      console.error(`✗ Lỗi khi xử lý ${dir}/plugin.json:`, error.message);
    }
  });
  
  // Ghi lại file plugin.json chính
  fs.writeFileSync(mainPluginPath, JSON.stringify(mainPlugin, null, 2) + '\n', 'utf8');
  
  console.log(`\n✓ Hoàn thành! Tổng số plugin: ${mainPlugin.data.length}`);
}

// Chạy hàm
mergePlugins();

console.log(`\n📌 Thông tin repo:`);
console.log(`   Owner:  ${CONFIG.repoOwner}`);
console.log(`   Repo:   ${CONFIG.repoName}`);
console.log(`   Branch: ${CONFIG.branch}`);
