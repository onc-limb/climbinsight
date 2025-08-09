# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

ClimbInsight の画像生成 AI サービス
提供されたクライミングウォールの画像と座標からホールドを抽出して、マスク画像とオリジナル画像にマスク画像を合わせた加工済み画像を返却する。

## Architecture

デプロイ、ホスティングは AWS SageMaker AI を使用。
画像処理には SAM を使用。
インターネット経由でエンドポイントにアクセス。

## Key Technologies

- AWS SageMaker AI
- SAM (Segment Anything Model)
- OpenCV and PIL
- PyTorch
- CUDA
