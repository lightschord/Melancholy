(() => {
  'use strict';

  const CONFIG = Object.freeze({
    USER_COUNT: 5000,
    ACTIVE_WINDOW_MS: 60 * 60 * 1000,
    INITIAL_HISTORY_MS: 24 * 60 * 60 * 1000,
    LOGIN_SIMULATION_INTERVAL_MS: 5000,
    UI_CLOCK_INTERVAL_MS: 1000,
    CAMERA_DEBOUNCE_MS: 300,
    SEOUL: { longitude: 126.9780, latitude: 37.5665 },
    DEFAULT_MBTI: 'INFP'
  });

  const MBTI_TYPES = [
    'ISTJ', 'ISFJ', 'INFJ', 'INTJ',
    'ISTP', 'ISFP', 'INFP', 'INTP',
    'ESTP', 'ESFP', 'ENFP', 'ENTP',
    'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'
  ];

  const HOTSPOTS = [
    { id: 'hongdae', name: '홍대입구', longitude: 126.9237, latitude: 37.5563, spread: 0.006 },
    { id: 'yeonnam', name: '연남동', longitude: 126.9244, latitude: 37.5651, spread: 0.0045 },
    { id: 'hapjeong', name: '합정', longitude: 126.9146, latitude: 37.5496, spread: 0.0045 },
    { id: 'gangnam', name: '강남역', longitude: 127.0276, latitude: 37.4979, spread: 0.005 },
    { id: 'sinsa', name: '신사', longitude: 127.0204, latitude: 37.5163, spread: 0.004 },
    { id: 'seongsu', name: '성수', longitude: 127.0557, latitude: 37.5446, spread: 0.004 },
    { id: 'seoulforest', name: '서울숲', longitude: 127.0374, latitude: 37.5446, spread: 0.004 },
    { id: 'itaewon', name: '이태원', longitude: 126.9947, latitude: 37.5345, spread: 0.0045 },
    { id: 'jamsil', name: '잠실', longitude: 127.1000, latitude: 37.5133, spread: 0.005 },
    { id: 'konkuk', name: '건대입구', longitude: 127.0692, latitude: 37.5404, spread: 0.004 },
    { id: 'sinchon', name: '신촌', longitude: 126.9368, latitude: 37.5598, spread: 0.004 },
    { id: 'daehangno', name: '대학로', longitude: 127.0018, latitude: 37.5826, spread: 0.004 },
    { id: 'jongno', name: '종로', longitude: 126.9876, latitude: 37.5704, spread: 0.0045 },
    { id: 'gwanghwamun', name: '광화문', longitude: 126.9769, latitude: 37.5759, spread: 0.004 },
    { id: 'yeouido', name: '여의도', longitude: 126.9244, latitude: 37.5219, spread: 0.005 },
    { id: 'mangwon', name: '망원', longitude: 126.9103, latitude: 37.5563, spread: 0.004 },
    { id: 'banpo', name: '반포', longitude: 126.9937, latitude: 37.5048, spread: 0.004 },
    { id: 'hangang', name: '한강공원', longitude: 126.9536, latitude: 37.5283, spread: 0.007 },
    { id: 'euljiro', name: '을지로', longitude: 126.9910, latitude: 37.5660, spread: 0.0035 },
    { id: 'yongsan', name: '용산', longitude: 126.9648, latitude: 37.5299, spread: 0.0045 }
  ];

  const MBTI_PROFILES = {
    INFP: { color: '#70e0cf', description: '감각적인 아이디어가 흐르는 곳', preferences: { yeonnam: 3.2, hongdae: 2.8, mangwon: 2.5, hangang: 1.8, gangnam: .55 } },
    ENFP: { color: '#f1a86b', description: '새로운 만남과 영감이 시작되는 곳', preferences: { hongdae: 3.2, itaewon: 2.6, seongsu: 2.4, hapjeong: 1.9, jongno: 1.2 } },
    INFJ: { color: '#b69af4', description: '조용한 영감과 깊은 대화가 있는 곳', preferences: { seoulforest: 2.8, yeonnam: 2.4, daehangno: 2.2, hangang: 1.9, banpo: 1.3 } },
    INTJ: { color: '#8fa9ff', description: '목적과 전략이 만나는 곳', preferences: { gangnam: 3.0, yeouido: 2.7, euljiro: 2.3, gwanghwamun: 2.1, seongsu: 1.6 } },
    INTP: { color: '#6cc6e8', description: '호기심이 지식으로 이어지는 곳', preferences: { daehangno: 3.0, sinchon: 2.7, seongsu: 2.4, hongdae: 1.8, euljiro: 1.6 } },
    ENTP: { color: '#f2769c', description: '아이디어가 빠르게 교차하는 곳', preferences: { seongsu: 3.2, euljiro: 2.8, gangnam: 2.4, hongdae: 2.1, itaewon: 1.7 } },
    ENFJ: { color: '#f3c65f', description: '사람과 에너지가 모이는 곳', preferences: { gangnam: 2.9, hongdae: 2.7, yeouido: 2.4, jamsil: 2.1, seongsu: 1.9 } },
    ENTJ: { color: '#ff7c68', description: '속도와 성취가 집중되는 곳', preferences: { gangnam: 3.5, yeouido: 3.0, jongno: 2.3, jamsil: 2.1, gwanghwamun: 1.8 } },
    ISFP: { color: '#d7a868', description: '취향과 여유가 머무는 곳', preferences: { mangwon: 3.1, hangang: 2.7, itaewon: 2.4, seoulforest: 2.2, banpo: 1.5 } },
    ESFP: { color: '#ff8a91', description: '오늘의 즐거움이 가득한 곳', preferences: { hongdae: 3.3, jamsil: 2.9, gangnam: 2.5, itaewon: 2.2, seongsu: 1.9 } },
    ISFJ: { color: '#a8c985', description: '익숙한 온기와 안심이 있는 곳', preferences: { sinchon: 2.8, yongsan: 2.5, banpo: 2.2, yeouido: 1.9, jongno: 1.6 } },
    ESFJ: { color: '#e9a4c5', description: '함께할수록 더 즐거운 곳', preferences: { jamsil: 3.0, gangnam: 2.7, yeouido: 2.4, konkuk: 2.2, hongdae: 1.7 } },
    ISTP: { color: '#8dc7b5', description: '호기심을 직접 움직이는 곳', preferences: { euljiro: 2.9, seongsu: 2.7, yongsan: 2.5, itaewon: 2.0, hapjeong: 1.5 } },
    ESTP: { color: '#e6b65c', description: '지금 이 순간을 즐기는 곳', preferences: { gangnam: 3.2, hongdae: 2.8, jamsil: 2.7, itaewon: 2.3, konkuk: 2.1 } },
    ISTJ: { color: '#91a4b9', description: '신뢰와 질서가 쌓이는 곳', preferences: { gwanghwamun: 3.0, yeouido: 2.7, jongno: 2.4, gangnam: 1.9, yongsan: 1.6 } },
    ESTJ: { color: '#cf9b72', description: '일의 흐름이 명확한 곳', preferences: { yeouido: 3.2, gangnam: 3.0, gwanghwamun: 2.5, jongno: 2.0, jamsil: 1.8 } }
  };

  const state = {
    users: [],
    selectedMbti: CONFIG.DEFAULT_MBTI,
    currentTime: Date.now(),
    recentUsers: [],
    clusters: [],
    viewer: null,
    clusterEntities: new Map(),
    cameraRefreshTimer: null,
    lastSimulationCount: 0,
    lastRefreshAt: 0,
    hotspotLabels: [],
    selectedEntity: null
  };

  const $ = (id) => document.getElementById(id);
  const randomInteger = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function createSeededRandom(seed) {
    let value = seed >>> 0;
    return () => {
      value = (value * 1664525 + 1013904223) >>> 0;
      return value / 4294967296;
    };
  }

  function gaussianRandom(random = Math.random) {
    let first = 0;
    let second = 0;
    while (first === 0) first = random();
    while (second === 0) second = random();
    return Math.sqrt(-2 * Math.log(first)) * Math.cos(Math.PI * 2 * second);
  }

  function getProfile(mbti) {
    return MBTI_PROFILES[mbti] || MBTI_PROFILES[CONFIG.DEFAULT_MBTI];
  }

  function pickWeightedHotspot(mbti, random = Math.random) {
    const preferences = getProfile(mbti).preferences;
    const weighted = HOTSPOTS.map((hotspot) => ({
      hotspot,
      weight: preferences[hotspot.id] || 0.62
    }));
    const total = weighted.reduce((sum, item) => sum + item.weight, 0);
    let cursor = random() * total;
    for (const item of weighted) {
      cursor -= item.weight;
      if (cursor <= 0) return item.hotspot;
    }
    return HOTSPOTS[HOTSPOTS.length - 1];
  }

  function generateLocationForMbti(mbti, random = Math.random) {
    const hotspot = pickWeightedHotspot(mbti, random);
    const spread = hotspot.spread;
    return {
      longitude: clamp(hotspot.longitude + gaussianRandom(random) * spread * 0.52, 126.78, 127.18),
      latitude: clamp(hotspot.latitude + gaussianRandom(random) * spread * 0.52, 37.42, 37.72),
      hotspotId: hotspot.id
    };
  }

  function createLoginTime(now, random = Math.random) {
    // Recent records are more common, while every initial record stays within 24 hours.
    const hoursAgo = Math.pow(random(), 2.1) * 24;
    return now - hoursAgo * 60 * 60 * 1000;
  }

  function createUser(id, now, random = Math.random) {
    const mbti = MBTI_TYPES[Math.floor(random() * MBTI_TYPES.length)];
    const location = generateLocationForMbti(mbti, random);
    return {
      userId: id,
      mbti,
      loginTime: createLoginTime(now, random),
      longitude: location.longitude,
      latitude: location.latitude,
      hotspotId: location.hotspotId
    };
  }

  function generateUsers(now) {
    const random = createSeededRandom(20260904);
    const users = new Array(CONFIG.USER_COUNT);
    for (let index = 0; index < CONFIG.USER_COUNT; index += 1) {
      users[index] = createUser(index + 1, now, random);
    }
    return users;
  }

  function getRecentUsers(users, mbti, now) {
    const startTime = now - CONFIG.ACTIVE_WINDOW_MS;
    return users.filter((user) => (
      user.mbti === mbti &&
      user.loginTime >= startTime &&
      user.loginTime <= now
    ));
  }

  function getGridConfig(cameraHeight) {
    if (cameraHeight < 2000) return { degrees: 0.001, label: '≈ 100 m' };
    if (cameraHeight < 10000) return { degrees: 0.003, label: '≈ 300 m' };
    if (cameraHeight < 30000) return { degrees: 0.01, label: '≈ 1 km' };
    return { degrees: 0.03, label: '≈ 3 km' };
  }

  function clusterUsers(users, gridDegrees, mbti) {
    const buckets = new Map();
    users.forEach((user) => {
      const gridX = Math.floor(user.longitude / gridDegrees);
      const gridY = Math.floor(user.latitude / gridDegrees);
      const id = `${gridX}_${gridY}_${mbti}`;
      let bucket = buckets.get(id);
      if (!bucket) {
        bucket = { id, mbti, count: 0, longitudeSum: 0, latitudeSum: 0 };
        buckets.set(id, bucket);
      }
      bucket.count += 1;
      bucket.longitudeSum += user.longitude;
      bucket.latitudeSum += user.latitude;
    });

    return [...buckets.values()]
      .map((bucket) => {
        const longitude = bucket.longitudeSum / bucket.count;
        const latitude = bucket.latitudeSum / bucket.count;
        const nearestHotspot = findNearestHotspot(longitude, latitude);
        return {
          id: bucket.id,
          mbti,
          count: bucket.count,
          longitude,
          latitude,
          place: `${nearestHotspot.name} 인근`,
          hotspotId: nearestHotspot.id
        };
      })
      .sort((a, b) => b.count - a.count);
  }

  function findNearestHotspot(longitude, latitude) {
    return HOTSPOTS.reduce((nearest, hotspot) => {
      const latitudeDistance = (hotspot.latitude - latitude) * 1.1;
      const longitudeDistance = hotspot.longitude - longitude;
      const distance = latitudeDistance * latitudeDistance + longitudeDistance * longitudeDistance;
      if (!nearest || distance < nearest.distance) return { hotspot, distance };
      return nearest;
    }, null).hotspot;
  }

  function formatTime(timestamp, includeSeconds = true) {
    return new Intl.DateTimeFormat('ko-KR', {
      hour: '2-digit', minute: '2-digit', second: includeSeconds ? '2-digit' : undefined,
      hour12: false
    }).format(new Date(timestamp));
  }

  function formatCoordinate(value) {
    return value.toFixed(4);
  }

  function formatHeight(height) {
    if (!Number.isFinite(height)) return '--';
    if (height >= 1000) return `${(height / 1000).toFixed(1)} km`;
    return `${Math.round(height)} m`;
  }

  function updateClockUi() {
    const now = state.currentTime;
    $('currentTime').textContent = formatTime(now);
    $('topbarClock').textContent = formatTime(now);
    $('analysisRange').textContent = `${formatTime(now - CONFIG.ACTIVE_WINDOW_MS, false)} ~ ${formatTime(now, false)}`;
  }

  function updateProfileUi() {
    const profile = getProfile(state.selectedMbti);
    $('legendMbti').textContent = state.selectedMbti;
    $('profileColor').style.backgroundColor = profile.color;
    $('profileColor').style.color = profile.color;
    $('profileDescription').textContent = profile.description;
  }

  function updateStatistics() {
    const clusters = state.clusters;
    const largest = clusters[0]?.count || 0;
    $('activeUsers').textContent = state.recentUsers.length.toLocaleString('ko-KR');
    $('clusterCount').textContent = clusters.length.toLocaleString('ko-KR');
    $('largestCluster').textContent = largest.toLocaleString('ko-KR');
    $('newLoginCount').textContent = state.lastSimulationCount.toLocaleString('ko-KR');
    $('pulseTrackFill').style.width = `${clamp(18 + state.lastSimulationCount * 9, 18, 92)}%`;
  }

  function updateCameraUi() {
    if (!state.viewer) return;
    const height = state.viewer.camera.positionCartographic.height;
    const grid = getGridConfig(height);
    $('cameraHeight').textContent = formatHeight(height);
    $('gridSizeLabel').textContent = grid.label;
  }

  function renderClusters(clusters) {
    if (!state.viewer) return;
    closeClusterPopup();
    state.selectedEntity = null;
    state.clusterEntities.forEach((entity) => state.viewer.entities.remove(entity));
    state.clusterEntities.clear();

    const profile = getProfile(state.selectedMbti);
    const color = Cesium.Color.fromCssColorString(profile.color);
    clusters.forEach((cluster) => {
      const radius = 150 + Math.sqrt(cluster.count) * 42;
      const entity = state.viewer.entities.add({
        id: `cluster-${cluster.id}`,
        position: Cesium.Cartesian3.fromDegrees(cluster.longitude, cluster.latitude, 35),
        point: {
          pixelSize: clamp(8 + Math.sqrt(cluster.count) * 1.6, 9, 28),
          color: color.withAlpha(0.95),
          outlineColor: Cesium.Color.WHITE.withAlpha(0.72),
          outlineWidth: 1,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        },
        ellipse: {
          semiMajorAxis: radius,
          semiMinorAxis: radius,
          height: 4,
          material: color.withAlpha(0.12),
          outline: true,
          outlineColor: color.withAlpha(0.7),
          outlineWidth: 1
        },
        label: {
          text: String(cluster.count),
          font: '600 12px DM Mono, monospace',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.fromCssColorString('#08111f'),
          outlineWidth: 4,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.CENTER,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          pixelOffset: new Cesium.Cartesian2(0, -22),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          scaleByDistance: new Cesium.NearFarScalar(500, 1.15, 90000, .86)
        }
      });
      entity.clusterData = cluster;
      state.clusterEntities.set(entity.id, entity);
    });
    state.clusters = clusters;
    updateStatistics();
    updateCameraUi();
  }

  function renderHotspotLabels() {
    if (!state.viewer) return;
    HOTSPOTS.forEach((hotspot) => {
      const entity = state.viewer.entities.add({
        id: `hotspot-${hotspot.id}`,
        position: Cesium.Cartesian3.fromDegrees(hotspot.longitude, hotspot.latitude, 15),
        label: {
          text: hotspot.name,
          font: '500 10px Manrope, sans-serif',
          fillColor: Cesium.Color.WHITE.withAlpha(.7),
          outlineColor: Cesium.Color.fromCssColorString('#0c1826'),
          outlineWidth: 3,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, 13),
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 26000),
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        }
      });
      state.hotspotLabels.push(entity);
    });
  }

  function refreshMap() {
    state.currentTime = Date.now();
    state.recentUsers = getRecentUsers(state.users, state.selectedMbti, state.currentTime);
    const cameraHeight = state.viewer?.camera.positionCartographic.height || 20000;
    const gridConfig = getGridConfig(cameraHeight);
    state.clusters = clusterUsers(state.recentUsers, gridConfig.degrees, state.selectedMbti);
    renderClusters(state.clusters);
    updateClockUi();
    updateStatistics();
    state.lastRefreshAt = state.currentTime;
  }

  function simulateNewLogins(now) {
    const loginCount = randomInteger(1, 10);
    for (let index = 0; index < loginCount; index += 1) {
      const user = state.users[randomInteger(0, state.users.length - 1)];
      const location = generateLocationForMbti(user.mbti);
      user.loginTime = now;
      user.longitude = location.longitude;
      user.latitude = location.latitude;
      user.hotspotId = location.hotspotId;
    }
    state.lastSimulationCount = loginCount;
  }

  function handleSimulationTick() {
    const now = Date.now();
    state.currentTime = now;
    simulateNewLogins(now);
    refreshMap();
  }

  function scheduleCameraRefresh() {
    window.clearTimeout(state.cameraRefreshTimer);
    state.cameraRefreshTimer = window.setTimeout(() => {
      updateCameraUi();
      refreshMap();
    }, CONFIG.CAMERA_DEBOUNCE_MS);
  }

  function positionPopup(entity) {
    if (!$('clusterPopup').hidden && entity?.position && state.viewer) {
      const position = entity.position.getValue(state.currentTime);
      const windowPosition = Cesium.SceneTransforms.worldToWindowCoordinates(state.viewer.scene, position);
      if (!windowPosition) return;
      const mapRect = $('cesiumContainer').getBoundingClientRect();
      const popup = $('clusterPopup');
      const popupWidth = popup.offsetWidth || 215;
      const popupHeight = popup.offsetHeight || 180;
      const left = clamp(windowPosition.x + 18, 12, mapRect.width - popupWidth - 12);
      const top = clamp(windowPosition.y - popupHeight / 2, 74, mapRect.height - popupHeight - 35);
      popup.style.left = `${left}px`;
      popup.style.top = `${top}px`;
    }
  }

  function showClusterPopup(entity, cluster) {
    const profile = getProfile(cluster.mbti);
    $('popupMbti').textContent = cluster.mbti;
    $('popupPlace').textContent = cluster.place;
    $('popupCount').textContent = `${cluster.count.toLocaleString('ko-KR')}명`;
    $('popupPosition').textContent = `${formatCoordinate(cluster.latitude)}, ${formatCoordinate(cluster.longitude)}`;
    $('popupSwatch').style.backgroundColor = profile.color;
    $('popupSwatch').style.color = profile.color;
    $('clusterPopup').hidden = false;
    state.selectedEntity = entity;
    positionPopup(entity);
  }

  function closeClusterPopup() {
    $('clusterPopup').hidden = true;
  }

  function initializeMap() {
    if (!window.Cesium) {
      $('mapLoading').hidden = true;
      $('mapError').hidden = false;
      return false;
    }

    try {
      const imageryProvider = new Cesium.UrlTemplateImageryProvider({
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        credit: '© OpenStreetMap contributors',
        maximumLevel: 19
      });
      state.viewer = new Cesium.Viewer('cesiumContainer', {
        baseLayer: new Cesium.ImageryLayer(imageryProvider),
        terrainProvider: new Cesium.EllipsoidTerrainProvider(),
        animation: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        navigationHelpButton: false,
        sceneModePicker: false,
        selectionIndicator: false,
        timeline: false,
        vrButton: false,
        shadows: false,
        shouldAnimate: false
      });
      state.viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#172a3a');
      state.viewer.scene.globe.showGroundAtmosphere = false;
      state.viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#101d2c');
      state.viewer.scene.fog.enabled = true;
      state.viewer.scene.fog.density = 0.00008;
      state.viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(CONFIG.SEOUL.longitude, CONFIG.SEOUL.latitude, 30000),
        orientation: { heading: 0, pitch: Cesium.Math.toRadians(-90), roll: 0 }
      });
      renderHotspotLabels();
      state.viewer.camera.changed.addEventListener(scheduleCameraRefresh);
      state.viewer.screenSpaceEventHandler.setInputAction((movement) => {
        const picked = state.viewer.scene.pick(movement.position);
        if (Cesium.defined(picked) && picked.id?.clusterData) {
          showClusterPopup(picked.id, picked.id.clusterData);
        } else {
          closeClusterPopup();
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      state.viewer.scene.postRender.addEventListener(() => {
        if (state.selectedEntity) positionPopup(state.selectedEntity);
      });
      $('mapLoading').hidden = true;
      refreshMap();
      return true;
    } catch (error) {
      console.error('Cesium initialization failed:', error);
      $('mapLoading').hidden = true;
      $('mapError').hidden = false;
      return false;
    }
  }

  function bindUi() {
    $('mbtiSelect').value = state.selectedMbti;
    $('mbtiSelect').addEventListener('change', (event) => {
      state.selectedMbti = event.target.value;
      updateProfileUi();
      closeClusterPopup();
      refreshMap();
    });
    $('closePopup').addEventListener('click', closeClusterPopup);
    $('zoomIn').addEventListener('click', () => state.viewer?.camera.zoomIn(state.viewer.camera.positionCartographic.height * .42));
    $('zoomOut').addEventListener('click', () => state.viewer?.camera.zoomOut(state.viewer.camera.positionCartographic.height * .42));
    $('resetView').addEventListener('click', () => state.viewer?.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(CONFIG.SEOUL.longitude, CONFIG.SEOUL.latitude, 30000),
      duration: .8
    }));
    window.addEventListener('resize', () => {
      state.viewer?.resize();
      scheduleCameraRefresh();
    });
  }

  function initialize() {
    state.users = generateUsers(state.currentTime);
    updateProfileUi();
    updateClockUi();
    bindUi();
    initializeMap();
    window.setInterval(() => {
      state.currentTime = Date.now();
      updateClockUi();
    }, CONFIG.UI_CLOCK_INTERVAL_MS);
    window.setInterval(handleSimulationTick, CONFIG.LOGIN_SIMULATION_INTERVAL_MS);

    // Expose read-only verification hooks without coupling the UI to a test runner.
    window.MBTIApp = Object.freeze({
      CONFIG,
      HOTSPOTS,
      MBTI_TYPES,
      state,
      getRecentUsers,
      clusterUsers,
      getGridConfig,
      refreshMap
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
