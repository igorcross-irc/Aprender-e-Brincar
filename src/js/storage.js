export class StorageManager {
  constructor() {
    this.SCORE_KEY = 'aprender_brincar_stars';
    this.CHILD_NAME_KEY = 'aprender_brincar_child_name';
  }

  getStars() {
    try {
      return parseInt(localStorage.getItem(this.SCORE_KEY) || '0', 10);
    } catch (e) {
      return 0;
    }
  }

  addStar() {
    const current = this.getStars() + 1;
    try {
      localStorage.setItem(this.SCORE_KEY, current.toString());
    } catch (e) {}
    return current;
  }

  resetStars() {
    try {
      localStorage.setItem(this.SCORE_KEY, '0');
    } catch (e) {}
    return 0;
  }

  getChildName() {
    try {
      const name = localStorage.getItem(this.CHILD_NAME_KEY);
      return name ? name.trim().slice(0, 15) : '';
    } catch (e) {
      return '';
    }
  }

  setChildName(name) {
    const clean = name.trim().slice(0, 15);
    try {
      localStorage.setItem(this.CHILD_NAME_KEY, clean);
    } catch (e) {}
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m]));
  }
}