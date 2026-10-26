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
 * Suy ra tên thư mục extension từ path của entry đã sinh trước đó
 * Ví dụ: .../extensions/mimih/plugin.zip => "mimih"
 */
function getExtDirFromEntry(entry) {
  const match = String(entry.path || '').match(/\/extensions\/([^/]+)\/plugin\.zip$/);
  return match ? match[1] : null;
}

/**
 * Kiểm tra metadata và các file đi kèm của một extension
 * Trả về danh sách cảnh báo (chuỗi), rỗng nghĩa là hợp lệ
 */
function validateExtension(dirPath, subPlugin) {
  const warnings = [];
  const metadata = subPlugin.metadata;

  if (!metadata.source) {
    warnings.push('thiếu metadata.source');
  }

  if (!metadata.regexp) {
    warnings.push('thiếu metadata.regexp (vBook sẽ không nhận diện được URL truyện)');
  }

  if (!fs.existsSync(path.join(dirPath, 'icon.png'))) {
    warnings.push('thiếu icon.png => icon trên repo sẽ 404');
  }

  if (!fs.existsSync(path.join(dirPath, 'plugin.zip'))) {
    warnings.push('thiếu plugin.zip => path trên repo sẽ 404 (cần build trước khi push)');
  }

  const script = subPlugin.script || {};

  Object.keys(script).forEach(key => {
    if (!fs.existsSync(path.join(dirPath, 'src', script[key]))) {
      warnings.push(`script.${key} trỏ tới file không tồn tại: src/${script[key]}`);
    }
  });

  return warnings;
}

/**
 * Hợp nhất các file plugin.json từ các thư mục con vào plugin.json chính
 */
function mergePlugins() {
  const rootDir = __dirname;
  const mainPluginPath = path.join(rootDir, 'plugin.json');
  const extensionsDir = path.join(rootDir, 'extensions');
  
  // Đọc file plugin.json chính
  const mainPlugin = JSON.parse(fs.readFileSync(mainPluginPath, 'utf8'));

  // Nếu chưa có mảng data, khởi tạo
  if (!Array.isArray(mainPlugin.data)) {
    mainPlugin.data = [];
  }

  // Quét các thư mục extension trong /extensions, sắp xếp để kết quả ổn định
  const dirs = fs.existsSync(extensionsDir)
    ? fs.readdirSync(extensionsDir, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)
        .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
    : [];

  const validDirs = new Set(); // thư mục extension hợp lệ trong lần chạy này
  const claimed = new Set();   // index trong data[] đã gán cho một thư mục
  const pruned = [];

  dirs.forEach(dir => {
    const dirPath = path.join(extensionsDir, dir);
    const pluginPath = path.join(dirPath, 'plugin.json');

    // Kiểm tra tồn tại file plugin.json
    if (!fs.existsSync(pluginPath)) {
      return;
    }

    let subPlugin;
    try {
      subPlugin = JSON.parse(fs.readFileSync(pluginPath, 'utf8'));
    } catch (error) {
      console.error(`✗ ${dir}/plugin.json không phải JSON hợp lệ: ${error.message}`);
      return;
    }

    // Kiểm tra metadata tồn tại
    if (!subPlugin.metadata) {
      console.warn(`⚠️  ${dir}/plugin.json không có metadata`);
      return;
    }

    const metadata = subPlugin.metadata;

    if (!String(metadata.name || '').trim()) {
      console.warn(`⚠️  ${dir}/plugin.json có metadata.name rỗng, bỏ qua`);
      return;
    }

    // Cảnh báo sớm các vấn đề làm entry sinh ra bị lỗi trên repo
    validateExtension(dirPath, subPlugin).forEach(warning => {
      console.warn(`⚠️  ${dir}: ${warning}`);
    });

    validDirs.add(dir);

    // Tạo object plugin theo định dạng chính
    const pluginData = {
      name: metadata.name,
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

    // Khớp entry cũ theo tên thư mục (đọc từ path), chỉ fallback theo name
    let existingIndex = mainPlugin.data.findIndex(
      item => getExtDirFromEntry(item) === dir
    );

    if (existingIndex === -1) {
      existingIndex = mainPlugin.data.findIndex(
        (item, index) =>
          !claimed.has(index) &&
          String(item.name || '').toLowerCase() === metadata.name.toLowerCase()
      );
    }

    if (existingIndex !== -1) {
      // Cập nhật plugin hiện tại (giữ nguyên vị trí trong mảng)
      mainPlugin.data[existingIndex] = pluginData;
      claimed.add(existingIndex);
      console.log(`✓ Cập nhật: ${metadata.name}`);
    } else {
      // Thêm plugin mới
      mainPlugin.data.push(pluginData);
      claimed.add(mainPlugin.data.length - 1);
      console.log(`✓ Thêm mới: ${metadata.name}`);
    }
  });

  // Xóa entry mồ côi: path trỏ tới thư mục extension không còn tồn tại
  mainPlugin.data = mainPlugin.data.filter((item, index) => {
    if (claimed.has(index)) {
      return true;
    }

    const dir = getExtDirFromEntry(item);

    if (!dir) {
      console.warn(`⚠️  Giữ nguyên "${item.name}": không suy ra được thư mục từ path (${item.path})`);
      return true;
    }

    if (validDirs.has(dir)) {
      return true;
    }

    pruned.push(`${item.name || dir} (extensions/${dir})`);
    return false;
  });

  // Ghi lại file plugin.json chính
  fs.writeFileSync(mainPluginPath, JSON.stringify(mainPlugin, null, 2) + '\n', 'utf8');

  pruned.forEach(label => console.log(`🗑  Đã xóa entry mồ côi: ${label}`));

  console.log(`\n✓ Hoàn thành! Tổng số plugin: ${mainPlugin.data.length}`);
}

// Chạy hàm
mergePlugins();

console.log(`\n📌 Thông tin repo:`);
console.log(`   Owner:  ${CONFIG.repoOwner}`);
console.log(`   Repo:   ${CONFIG.repoName}`);
console.log(`   Branch: ${CONFIG.branch}`);
