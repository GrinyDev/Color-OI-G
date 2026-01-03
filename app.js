// 使用Intersection Observer优化滚动动画
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      observer.unobserve(entry.target); // 观察一次后停止
    }
  });
}, observerOptions);

// 观察所有需要动画的元素
document.querySelectorAll('.reveal').forEach(el => {
  observer.observe(el);
});

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();

    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});

// 导航栏滚动效果
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// 页面加载动画优化
window.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('loaded');
});

// 相册功能
const images = [{
    url: './sicon/a.jpg',
    alt: 'Home Screen'
  },
  {
    url: './sicon/b.jpg',
    alt: 'Color Picker'
  },
  {
    url: './sicon/c.jpg',
    alt: 'Color Palette'
  },
  {
    url: './sicon/d.jpg',
    alt: 'Gradient Maker'
  },
  {
    url: './sicon/e.jpg',
    alt: 'Color Game'
  }
];

let currentIndex = 0;
let autoSlideInterval;
const mainImage = document.getElementById('mainImage');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const thumbnails = document.getElementById('thumbnails');
const albumContainer = document.querySelector('.album-container');

// 更新主图片
function updateMainImage(index) {
  mainImage.style.opacity = '0';
  setTimeout(() => {
    mainImage.src = images[index].url;
    mainImage.alt = images[index].alt;
    mainImage.style.opacity = '1';
  }, 200);
}

// 更新缩略图激活状态
function updateThumbnails(index) {
  document.querySelectorAll('.thumbnail-item').forEach(item => {
    item.classList.remove('active');
  });
  document.querySelector(`[data-index="${index}"]`).classList.add('active');
}

// 切换到上一张
function showPrevious() {
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  updateMainImage(currentIndex);
  updateThumbnails(currentIndex);
  resetAutoSlide();
}

// 切换到下一张
function showNext() {
  currentIndex = (currentIndex + 1) % images.length;
  updateMainImage(currentIndex);
  updateThumbnails(currentIndex);
  resetAutoSlide();
}

// 判断是否为移动设备
function isMobileDevice() {
  return window.innerWidth < 768;
}

// 自动切换图片 - 只在桌面端启用
function startAutoSlide() {
  if (!isMobileDevice()) {
    autoSlideInterval = setInterval(showNext, 10000);
  }
}

// 停止自动切换
function stopAutoSlide() {
  if (autoSlideInterval) {
    clearInterval(autoSlideInterval);
    autoSlideInterval = null;
  }
}

// 重置自动切换定时器 - 只在桌面端启用
function resetAutoSlide() {
  stopAutoSlide();
  startAutoSlide();
}

// 事件监听器 - 优化点击事件处理，防止多次触发
let isClicking = false;

prevBtn.addEventListener('click', () => {
  if (!isClicking) {
    isClicking = true;
    showPrevious();
    setTimeout(() => {
      isClicking = false;
    }, 300); // 添加300ms的防抖
  }
});

nextBtn.addEventListener('click', () => {
  if (!isClicking) {
    isClicking = true;
    showNext();
    setTimeout(() => {
      isClicking = false;
    }, 300); // 添加300ms的防抖
  }
});

// 缩略图点击事件
thumbnails.addEventListener('click', (e) => {
  const thumbnail = e.target.closest('.thumbnail-item');
  if (thumbnail) {
    const index = parseInt(thumbnail.dataset.index);
    currentIndex = index;
    updateMainImage(currentIndex);
    updateThumbnails(currentIndex);
    resetAutoSlide();
  }
});

// 键盘导航
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') {
    showPrevious();
  } else if (e.key === 'ArrowRight') {
    showNext();
  }
});

// 鼠标悬停时暂停自动切换，离开时恢复 - 只在桌面端添加
if (!isMobileDevice()) {
  albumContainer.addEventListener('mouseenter', stopAutoSlide);
  albumContainer.addEventListener('mouseleave', startAutoSlide);
}

// 触摸滑动功能
let touchStartX = 0;
let touchEndX = 0;
let isSwiping = false;
let lastSwipeTime = 0;

// 开始触摸
albumContainer.addEventListener('touchstart', (e) => {
  // 只处理第一个触摸点
  if (e.touches.length === 1) {
    touchStartX = e.touches[0].screenX;
    stopAutoSlide(); // 触摸时暂停自动切换
    isSwiping = false;
  }
});

// 触摸移动
albumContainer.addEventListener('touchmove', (e) => {
  if (e.touches.length === 1) {
    isSwiping = true;
  }
});

// 结束触摸
albumContainer.addEventListener('touchend', (e) => {
  if (e.changedTouches.length === 1 && isSwiping) {
    // 防止短时间内多次触发滑动
    const currentTime = Date.now();
    if (currentTime - lastSwipeTime > 300) {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
      lastSwipeTime = currentTime;
    }
    // 只有在桌面端才恢复自动切换
    if (!isMobileDevice()) {
      startAutoSlide();
    }
  }
});

// 处理滑动
function handleSwipe() {
  const swipeThreshold = 80; // 增加滑动阈值，减少误触发
  const swipeDistance = touchStartX - touchEndX;
  
  if (Math.abs(swipeDistance) > swipeThreshold) {
    // 直接修改索引，不调用showNext/showPrevious，避免多次重置定时器
    if (swipeDistance > 0) {
      // 向左滑动，显示下一张
      currentIndex = (currentIndex + 1) % images.length;
    } else {
      // 向右滑动，显示上一张
      currentIndex = (currentIndex - 1 + images.length) % images.length;
    }
    // 更新图片和缩略图
    updateMainImage(currentIndex);
    updateThumbnails(currentIndex);
    // 只有在桌面端才启动自动切换
    if (!isMobileDevice()) {
      startAutoSlide();
    }
  }
}

// 初始化自动切换 - 只在桌面端启用
startAutoSlide();



// 扫码下载弹窗功能
const scanBtn = document.getElementById('scanBtn');
const scanModal = document.getElementById('scanModal');
const closeBtn = document.getElementById('closeBtn');

// 显示弹窗
function showScanModal() {
  scanModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// 隐藏弹窗
function hideScanModal() {
  scanModal.classList.remove('active');
  document.body.style.overflow = 'auto';
}

// 点击扫码按钮显示弹窗
if (scanBtn) {
  scanBtn.addEventListener('click', showScanModal);
}

// 点击关闭按钮关闭弹窗
if (closeBtn) {
  closeBtn.addEventListener('click', hideScanModal);
}

// 点击弹窗外部区域关闭弹窗
if (scanModal) {
  scanModal.addEventListener('click', (e) => {
    if (e.target === scanModal) {
      hideScanModal();
    }
  });
}

// 键盘ESC键关闭弹窗
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && scanModal && scanModal.classList.contains('active')) {
    hideScanModal();
  }
});